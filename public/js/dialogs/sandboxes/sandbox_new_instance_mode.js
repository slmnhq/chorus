;(function(ns, $) {
    ns.views.SandboxNewInstanceMode = ns.views.Base.extend({
        className: "sandbox_new_instance_mode",

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
            this.$('.instance .loading_text').removeClass('hidden');
            this.instances.fetchAll();
        },

        postRender: function() {
            this.$('.loading_spinner').startLoading();
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
            this.trigger("new:input")
            this.checkIfValid();
        },

        createNewDatabase: function (e) {
            e.preventDefault();

            delete this.selectedDatabase;
            this.hideSelect("database");
            this.hideSelect("schema");

            this.showCreateFields("database", { showCancelLink: true });
            this.showCreateFields("schema", { showCancelLink: false });

            this.$(".schema input.name").val("public");
            this.checkIfValid();
        },

        cancelNewDatabase: function(e) {
            e.preventDefault();

            this.hideCreateFields("database");
            this.hideCreateFields("schema");
            this.showSection("database");

            this.$(".schema a.new").addClass("hidden");
        },

        createNewSchema: function (e) {
            e.preventDefault();

            delete this.selectedSchema;
            this.$(".schema input.name").val("");

            this.hideSelect("schema");
            this.showCreateFields("schema", { showCancelLink: true });
            this.checkIfValid();
        },

        cancelNewSchema: function(e) {
            e.preventDefault();
            this.databaseSelected();
            this.hideCreateFields("schema");
            this.showSection("schema");
        },

        showSection: function(type, options) {
            var section = this.$("." + type);
            section.find("a.new").removeClass("hidden");
            section.find("label").removeClass("hidden");

            if (options && options.loading) {
                section.find(".loading_text").removeClass('hidden');
                section.find(".select_container").hide();
                section.find(".unavailable").hide();
            } else {
                section.find(".loading_text").addClass('hidden');
                if (options && options.unavailable) {
                    section.find(".unavailable").show();
                } else {
                    section.find(".select_container").show();
                }
            }
            chorus.styleSelect(section.find("select"));
            this.checkIfValid();
        },

        hideSelect: function(type) {
            this.$("." + type + " .select_container").hide();
        },

        resetSelect: function(type) {
            var section = this.$("." + type);
            section.find("label").addClass("hidden");
            section.find("a.new").addClass("hidden");
            delete this["selected" + _.capitalize(type)];
            this.checkIfValid();

            var select = section.find("select");
            select.empty();
            select.closest('.select_container').hide();
            select.append($("<option/>").prop('value', '').text(t("sandbox.select_one")));
            return select;
        },

        updateInstances : function() {
            this.updateFor('instance', function(instance) {return instance.get("instanceProvider") != "Hadoop"});
        },

        updateDatabases : function() {
            this.updateFor('database');
        },

        updateSchemas : function() {
            this.updateFor('schema');
        },

        hideCreateFields: function(type) {
            this.$("." + type + " label").addClass("hidden");
            this.$("." + type + " .new").removeClass("hidden");
            this.$("." + type + " .create_container").addClass("hidden");
        },

        showCreateFields: function(type, options) {
            var createContainer = this.$("." + type + " .create_container");
            createContainer.removeClass("hidden");
            this.$("." + type + " label").removeClass("hidden");
            this.$("." + type + " a.new").addClass("hidden");

            if (options && options.showCancelLink) {
                createContainer.addClass("show_cancel_link");
            } else {
                createContainer.removeClass("show_cancel_link");
            }
        },

        checkIfValid: function() {
            this.trigger("change");
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
        }
    });
})(chorus, jQuery);
