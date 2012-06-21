;(function() {
    var HIDDEN = 0,
        LOADING = 1,
        SELECT = 2,
        STATIC = 3,
        UNAVAILABLE = 4,
        CREATE_NEW = 5,
        CREATE_NESTED = 6;

    chorus.views.SchemaPicker = chorus.views.Base.extend({
        constructorName: "SchemaPickerView",
        templateName:"schema_picker",

        events: {
            "change .instance select": "instanceSelected",
            "change .database select": "databaseSelected",
            "change .schema select": "schemaSelected",
            "click .database a.new": "createNewDatabase",
            "click .database .cancel": "cancelNewDatabase",
            "click .schema a.new": "createNewSchema",
            "click .schema .cancel": "cancelNewSchema"
        },

        setup: function () {
            //Prebind these so the BindingGroup detects duplicates each time and doesn't bind them multiple times.
            this.instanceFetchFailed = _.bind(this.fetchFailed, this, null);
            this.databaseFetchFailed = _.bind(this.fetchFailed, this, 'database');
            this.schemaFetchFailed = _.bind(this.fetchFailed, this, 'schema');

            this.sectionStates = {};

            if (this.options.instance) {
                this.setState({ instance: STATIC, database: LOADING });
            } else {
                this.setState({ instance: LOADING, database: HIDDEN });

                this.instances = new chorus.collections.InstanceSet();
                this.instances.onLoaded(this.instancesLoaded, this);
                this.bindings.add(this.instances, "fetchFailed", this.instanceFetchFailed);
                this.instances.fetchAll();
            }

            this.setState({ schema: HIDDEN });
        },

        setState: function(params) {
            _.each(params, function(stateValue, sectionName) {
                this.sectionStates[sectionName] = stateValue;
                this.updateSectionToReflectState(sectionName);
            }, this);

            this.triggerSchemaSelected();
        },

        postRender:function () {
            if (this.options.instance) {
                if (this.options.database) {
                    this.selectedInstance = this.options.instance;
                    this.databaseSelected();
                } else {
                    this.instanceSelected();
                }
            }

            this.updateDomToReflectStates();

            this.$('.loading_spinner').startLoading();
            this.$("input.name").bind("textchange", _.bind(this.triggerSchemaSelected, this))
        },

        updateDomToReflectStates: function() {
            _.each(["instance", "database", "schema"], function(sectionName) {
                this.updateSectionToReflectState(sectionName);
            }, this);
        },

        updateSectionToReflectState: function(type) {
            var section = this.$("." + type);
            var state = this.sectionStates[type];
            section.removeClass("hidden");
            section.find("a.new").removeClass("hidden");
            section.find(".loading_text, .select_container, .create_container, .unavailable").addClass("hidden");
            section.find(".create_container").removeClass("show_cancel_link");

            switch (state) {
                case LOADING:
                    section.find(".loading_text").removeClass("hidden");
                    break;
                case SELECT:
                    section.find(".select_container").removeClass("hidden");
                    this.populateSelect(type);
                    break;
                case CREATE_NEW:
                    section.find(".create_container").removeClass("hidden");
                    section.find(".create_container").addClass("show_cancel_link");
                    section.find("a.new").addClass("hidden");
                    break;
                case CREATE_NESTED:
                    section.find(".create_container").removeClass("hidden");
                    section.find("a.new").addClass("hidden");
                    break;
                case UNAVAILABLE:
                    section.find(".unavailable").removeClass("hidden");
                    break;
                case HIDDEN:
                    section.addClass("hidden");
                    break;
            }
        },

        instanceSelected:function () {
            this.resetSelect('database');
            this.resetSelect('schema');
            this.selectedInstance = this.getSelectedInstance();

            if (this.selectedInstance) {
                this.setState({ database: LOADING });

                this.databases = this.selectedInstance.databases();
                this.databases.fetchAllIfNotLoaded();
                this.bindings.add(this.databases, "fetchFailed", this.databaseFetchFailed);
                this.databases.onLoaded(this.databasesLoaded, this);
            } else {
                this.setState({ database: HIDDEN });
            }
        },

        getSelectedInstance: function() {
            return this.options.instance || this.instances.get(this.$('.instance select option:selected').val());
        },

        databaseSelected:function () {
            this.resetSelect('schema');
            this.selectedDatabase = this.getSelectedDatabase();

            if (this.selectedDatabase) {
                this.setState({ schema: LOADING });

                this.schemas = this.selectedDatabase.schemas();
                this.schemas.fetchAllIfNotLoaded();
                this.bindings.add(this.schemas, "fetchFailed", this.schemaFetchFailed);
                this.schemas.onLoaded(this.schemasLoaded, this);
            } else {
                this.setState({ schema: HIDDEN });
            }
        },

        fetchFailed: function(type, collection) {
            if(type) {
                this.resetSelect(type);
            }
            this.trigger("error", collection);
        },

        getSelectedDatabase : function() {
            return this.options.database || this.databases.get(this.$('.database select option:selected').val());
        },

        schemaSelected:function () {
            this.selectedSchema = this.schemas.get(this.$('.schema select option:selected').val());
            this.triggerSchemaSelected();
        },

        createNewDatabase:function (e) {
            e.preventDefault();

            delete this.selectedDatabase;

            this.setState({
                database: CREATE_NEW,
                schema: CREATE_NESTED
            });
            this.$(".schema input.name").val(chorus.models.Schema.DEFAULT_NAME);
        },

        createNewSchema:function (e) {
            e.preventDefault();

            delete this.selectedSchema;
            this.setState({ schema: CREATE_NEW });
            this.$(".schema input.name").val("");
        },

        cancelNewDatabase:function (e) {
            e.preventDefault();
            this.databasesLoaded();
        },

        cancelNewSchema:function (e) {
            e.preventDefault();
            this.schemasLoaded();
        },

        resetSelect: function (type) {
            delete this["selected" + _.capitalize(type)];
            this.triggerSchemaSelected();
            this.trigger("clearErrors");

            var select = this.$("." + type).find("select");
            select.empty();
            select.append($("<option/>").prop('value', '').text(t("sandbox.select_one")));
            return select;
        },

        greenplumInstances: function() {
            return this.instances.filter(function(instance) {
                return instance.get("instanceProvider") != "Hadoop";
            });
        },

        instancesLoaded: function () {
            var state = (this.greenplumInstances().length === 0) ? UNAVAILABLE : SELECT;
            this.setState({ instance: state });
        },

        databasesLoaded: function () {
            this.resetSelect("schema");

            var state = (this.databases.length === 0) ? UNAVAILABLE : SELECT;
            this.setState({
                database: state,
                schema: HIDDEN
            });
        },

        schemasLoaded: function () {
            var state = (this.schemas.length === 0) ? UNAVAILABLE : SELECT;
            this.setState({ schema: state });
        },

        triggerSchemaSelected: function() {
            this.trigger("change", this.ready());
        },

        ready: function () {
            var attrs = this.fieldValues();
            return !!(attrs.instance && (attrs.database || attrs.databaseName) && (attrs.schema || attrs.schemaName));
        },

        fieldValues: function () {
            var attrs = {
                instance:this.selectedInstance && this.selectedInstance.get("id")
            };

            if (this.selectedDatabase && this.selectedDatabase.get('id')) {
                attrs.database = this.selectedDatabase.get("id");
            } else if(this.selectedDatabase && this.selectedDatabase.get("name")) {
                attrs.databaseName = this.selectedDatabase.get('name');
            } else {
                attrs.databaseName = this.$(".database input.name:visible").val();
            }

            if (this.selectedSchema) {
                attrs.schema = this.selectedSchema.get("id");
            } else {
                attrs.schemaName = this.$(".schema input.name:visible").val();
            }
            return attrs;
        },

        populateSelect: function(type) {
            var models = (type === "instance") ? this.greenplumInstances() : this[type + "s"].models;
            var select = this.resetSelect(type);

            _.each(this.sortModels(models), function(model) {
                var option = $("<option/>")
                    .prop("value", model.get("id"))
                    .text(model.get("name"))
                    .prop("disabled", (type === "instance") && !model.get("hasCredentials"));
                select.append(option);
            });

            chorus.styleSelect(select);
        },

        sortModels: function(models) {
            return _.clone(models).sort(function(a, b) {
                return naturalSort(a.get("name").toLowerCase(), b.get("name").toLowerCase());
            });
        },

        additionalContext:function () {
            return {
                "allowCreate":this.options.allowCreate,
                options: this.options
            }
        }
    });
})();

