;
(function(ns) {
    ns.dialogs.SandboxNew = ns.dialogs.Base.extend({
        className : "sandbox_new",
        title: t("sandbox.new_dialog.title"),

        persistent: true,

        events : {
            "change .instance select" : "instanceSelected",
            "change .database select" : "databaseSelected",
            "change .schema select"   : "schemaSelected",
            "click button.submit"     : "save",
            "click .database a.new"   : "createNewDatabase",
            "click .schema a.new"     : "createNewSchema",
            "click .database .cancel" : "cancelNewDatabase",
            "click .schema .cancel"   : "cancelNewSchema",
            "keyup input.name"        : "enableOrDisableSaveButton",
            "paste input.name"        : "enableOrDisableSaveButton"
        },

        makeModel: function() {
            this._super("makeModel", arguments);
            var workspaceId = this.options.launchElement.data("workspaceId");
            this.model = new ns.models.Sandbox({ workspaceId: workspaceId });
            this.model.bind("saved", this.saved, this);
            this.model.bind("saveFailed", this.saveFailed, this);
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

        createNewDatabase: function (e) {
            e.preventDefault();

            delete this.selectedDatabase;
            this.hideSelect("database");
            this.hideSelect("schema");

            this.showCreateFields("database", { showCancelLink: true });
            this.showCreateFields("schema", { showCancelLink: false });

            this.$(".schema input.name").val("public");
            this.enableOrDisableSaveButton();
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
            this.enableOrDisableSaveButton();
        },

        cancelNewSchema: function(e) {
            e.preventDefault();
            this.databaseSelected();
            this.hideCreateFields("schema");
            this.showSection("schema");
        },

        updateInstances : function() {
            this.updateFor('instance', function(instance) {return instance.get("instanceProvider") != "Hadoop"});
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

        updateDatabases : function() {
            this.updateFor('database');
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

        updateSchemas : function() {
            this.updateFor('schema');
        },

        schemaSelected: function() {
            this.selectedSchema = this.schemas.get(this.$('.schema select option:selected').val());
            this.enableOrDisableSaveButton();
        },

        showSection: function(type, options) {
            var section = this.$("." + type);
            section.find("a.new").removeClass("hidden");
            section.find("label").removeClass("hidden");

            if (options && options.loading) {
                section.find(".loading_text").removeClass('hidden');
                section.find(".select_container").hide();
            } else {
                section.find(".loading_text").addClass('hidden');
                if (options && options.unavailable) {
                    section.find(".unavailable").show();
                } else {
                    section.find(".select_container").show();
                }
            }
            chorus.styleSelect(section.find("select"));
            this.enableOrDisableSaveButton();
        },

        hideSelect: function(type) {
            this.$("." + type + " .select_container").hide();
        },

        resetSelect: function(type) {
            var section = this.$("." + type);
            section.find("label").addClass("hidden");
            section.find("a.new").addClass("hidden");
            delete this["selected" + _.capitalize(type)];
            this.enableOrDisableSaveButton();

            var select = section.find("select");
            select.empty();
            select.closest('.select_container').hide();
            select.append($("<option/>").prop('value', '').text(t("sandbox.select_one")));
            return select;
        },

        save: function(e) {
            this.$("button.submit").startLoading("sandbox.adding_sandbox");
            var attrs = {
                instance: this.selectedInstance.get("id")
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
            this.model.save(attrs);
        },

        saved: function() {
            ns.toast("sandbox.create.toast");
            this.pageModel.fetch();
            this.pageModel.trigger("invalidated");
            this.closeModal();
        },

        saveFailed: function() {
            this.$("button.submit").stopLoading();
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

        enableOrDisableSaveButton: function() {
            var schemaName = this.$(".schema input.name");
            var databaseName = this.$(".database input.name");
            var hasSchema = (schemaName.is(":visible") && schemaName.val().length > 0) || this.selectedSchema;
            var hasDatabase = (databaseName.is(":visible") && databaseName.val().length > 0) || this.selectedDatabase;
            if (hasSchema && hasDatabase) {
                this.$("button.submit").removeAttr("disabled");
            } else {
                this.$("button.submit").attr("disabled", "disabled");
            }
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
})(chorus);
