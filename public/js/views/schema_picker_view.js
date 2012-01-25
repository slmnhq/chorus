;(function(ns, $) {
    ns.views.SchemaPicker = ns.views.Base.extend({
        className: "schema_picker",

        events : {
            "change .instance select" : "instanceSelected",
            "change .database select" : "databaseSelected",
            "change .schema select"   : "schemaSelected",
            "click .database a.new"   : "createNewDatabase",
            "click .database .cancel" : "cancelNewDatabase",
            "click .schema a.new"     : "createNewSchema",
            "click .schema .cancel"   : "cancelNewSchema"
        },

        setup: function() {
            this.instances = new ns.models.InstanceSet();
            this.instances.bind("reset", this.updateInstances, this);
            this.instances.fetchAll();
        },

        postRender: function() {
            this.$('.loading_spinner').startLoading();
            this.$("input.name").bind("textchange", _.bind(this.checkIfValid, this))
        },

        instanceSelected : function() {
            this.resetSelect('database');
            this.resetSelect('schema');
            this.selectedInstance = this.instances.get(this.$('.instance select option:selected').val());
            if (this.selectedInstance) {
                this.showSection("database", { loading: true });
                this.databases = this.selectedInstance.databases();
                this.databases.bind("reset", this.updateDatabases, this);
                this.databases.fetch();
            }
        },

        databaseSelected : function() {
            this.resetSelect('schema');
            this.selectedDatabase = this.databases.get(this.$('.database select option:selected').val());
            if (this.selectedDatabase) {
                this.showSection("schema", { loading: true });
                this.schemas = this.selectedDatabase.schemas();
                this.schemas.bind("reset", this.updateSchemas, this);
                this.schemas.fetch();
            }
        },

        schemaSelected: function() {
            this.selectedSchema = this.schemas.get(this.$('.schema select option:selected').val());
            this.checkIfValid();
        },

        createNewDatabase: function (e) {
            e.preventDefault();

            delete this.selectedDatabase;
            this.showSection("database", { create: true, cancelLink: true });
            this.showSection("schema", { create: true, cancelLink: false });
            this.$(".schema input.name").val(ns.models.Schema.DEFAULT_NAME);
        },

        createNewSchema: function (e) {
            e.preventDefault();

            delete this.selectedSchema;
            this.$(".schema input.name").val("");

            this.showSection("schema", { create: true, cancelLink: true });
        },

        cancelNewDatabase: function(e) {
            e.preventDefault();
            this.updateDatabases();
        },

        cancelNewSchema: function(e) {
            e.preventDefault();
            this.updateSchemas();
        },

        showSection: function(type, options) {
            options || (options = {});
            var section = this.$("." + type);
            section.removeClass("hidden");
            section.find("a.new").removeClass("hidden");
            section.find(".loading_text").addClass('hidden');
            section.find(".create_container").addClass('hidden');
            section.find(".select_container").addClass("hidden")
            section.find(".unavailable").addClass("hidden")

            if (options.loading)          { section.find(".loading_text").removeClass('hidden'); }
            else if (options.unavailable) { section.find(".unavailable").removeClass("hidden"); }
            else if (options.create) {
                var createContainer = section.find(".create_container");
                section.find("a.new").addClass("hidden");
                createContainer.removeClass("hidden");
                if (options.cancelLink) {
                    createContainer.addClass("show_cancel_link");
                } else {
                    createContainer.removeClass("show_cancel_link");
                }
            } else {
                section.find("a.new").removeClass("hidden");
                section.find(".select_container").removeClass("hidden");
                chorus.styleSelect(section.find("select"));
            }
            this.checkIfValid();
        },

        resetSelect: function(type) {
            var section = this.$("." + type);
            section.addClass("hidden");
            section.find("a.new").addClass("hidden");
            delete this["selected" + _.capitalize(type)];
            this.checkIfValid();

            var select = section.find("select");
            select.empty();
            select.closest('.select_container').addClass("hidden")
            select.append($("<option/>").prop('value', '').text(t("sandbox.select_one")));
            return select;
        },

        updateInstances : function() {
            this.updateFor('instance', function(instance) {return instance.get("instanceProvider") != "Hadoop"});
        },

        updateDatabases : function() {
            this.resetSelect("schema");
            this.updateFor('database');
        },

        updateSchemas : function() {
            this.updateFor('schema');
        },

        checkIfValid: function() {
            this.trigger("change");
        },

        ready: function() {
            var attrs = this.fieldValues();
            return attrs.instance && (attrs.database || attrs.databaseName) && (attrs.schema || attrs.schemaName);
        },

        fieldValues: function() {
            var attrs = {
                instance: this.selectedInstance && this.selectedInstance.get("id")
            };
            if (this.selectedDatabase) {
                attrs.database = this.selectedDatabase.get("id");
            } else {
                attrs.databaseName = this.$(".database input.name").val();
            }
            if (this.selectedSchema) {
                attrs.schema = this.selectedSchema.get("id");
            } else {
                attrs.schemaName = this.$(".schema input.name").val();
            }
            return attrs;
        },

        updateFor: function(type, filter) {
            var select = this.resetSelect(type);
            var collection = this[type + "s"];

            filter || (filter = function(){return true;});
            // don't modify the original collection array object
            var models = _(collection.models).chain().clone().filter(filter).value();
            models.sort(function(a, b) {
                return naturalSort(a.get("name").toLowerCase(), b.get("name").toLowerCase());
            });
            _.each(models, function(model) {
                select.append(
                    $("<option/>", {value : model.get("id")}).text(model.get("name"))
                );
            });

            this.showSection(type, { loading: false, unavailable: (models.length === 0) });
        },

        additionalContext: function() {
            return {
                "allowCreate": this.options.allowCreate
            }
        }
    });
})(chorus, jQuery);
