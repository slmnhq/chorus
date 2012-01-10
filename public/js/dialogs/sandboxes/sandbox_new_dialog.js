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
            "click a.new_database"    : "createNewDatabase",
            "click a.new_schema"      : "createNewSchema",
            "click .database .cancel" : "cancelNewDatabase",
            "click .schema .cancel"   : "cancelNewSchema"
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

            this.hideSelect("database");
            this.hideSelect("schema");

            this.showCreateFields("database", { showCancelLink: true });
            this.showCreateFields("schema", { showCancelLink: false });

            this.$(".modal_controls button.submit").prop("disabled", "disabled");
        },

        cancelNewDatabase: function(e) {
            e.preventDefault();
            this.instanceSelected();

            this.showSelect("database");
            this.hideCreateFields("database");
            this.hideCreateFields("schema");

            this.$("a.new_schema").addClass("hidden");
        },

        createNewSchema: function (e) {
            e.preventDefault();

            this.hideSelect("schema");
            this.showCreateFields("schema", { showCancelLink: true });

            this.$(".modal_controls button.submit").prop("disabled", "disabled");
        },

        cancelNewSchema: function(e) {
            e.preventDefault();
            this.databaseSelected();
            this.showSelect("schema");
            this.hideCreateFields("schema");
        },

        updateInstances : function() {
            this.updateFor('instance');
        },

        instanceSelected : function() {
            this.resetSelect('database');
            this.resetSelect('schema');
            this.selectedInstance = this.instances.get(this.$('.instance select option:selected').val());
            if (this.selectedInstance) {
                this.databases = this.selectedInstance.databases();
                this.databases.bind("reset", this.updateDatabases, this);
                this.$(".database label").removeClass("hidden");
                this.$('.database .loading_text').removeClass('hidden');
                this.$('a.new_database').removeClass('hidden');
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
                this.schemas = this.selectedDatabase.schemas();
                this.schemas.bind("reset", this.updateSchemas, this);
                this.$(".schema label").removeClass("hidden");
                this.$('.schema .loading_text').removeClass('hidden');
                this.$('a.new_schema').removeClass('hidden');
                this.schemas.fetch();
            }
        },

        updateSchemas : function() {
            this.updateFor('schema');
        },

        schemaSelected: function() {
            this.selectedSchema = this.schemas.get(this.$('.schema select option:selected').val());
            if (this.selectedSchema) {
                this.$('.modal_controls button.submit').prop('disabled', false);
            } else {
                this.$('.modal_controls button.submit').prop('disabled', "disabled");
            }
        },

        showSelect: function(type) {
            this.$("." + type + " .select_container").show();
            var select = this.$("." + type + " select");
            chorus.styleSelect(select);
        },

        hideSelect: function(type) {
            this.$("." + type + " .select_container").hide();
        },

        resetSelect: function(type) {
            this.$("." + type + " label").addClass("hidden");
            this.$("." + type + " .new_" + type).addClass("hidden");
            this.$(".modal_controls button.submit").prop("disabled", "disabled");

            var select = this.$("." + type + " select");
            select.empty();
            select.closest('.select_container').hide();
            select.append($("<option/>").prop('value', '').text(t("sandbox.select_one")));
            return select;
        },

        save: function(e) {
            this.$("button.submit").startLoading("sandbox.adding_sandbox");
            this.model.save({
                instance: this.selectedInstance.get("id"),
                database: this.selectedDatabase.get("id"),
                schema: this.selectedSchema.get("id")
            });
        },

        saved: function() {
            ns.toast("sandbox.create.toast");
            this.pageModel.fetch();
            this.closeModal();
        },

        saveFailed: function() {
            this.$("button.submit").stopLoading();
        },

        hideCreateFields: function(type) {
            this.$("." + type + " label").addClass("hidden");
            this.$("." + type + " .new_" + type).removeClass("hidden");
            this.$("." + type + " .create_container").addClass("hidden");
        },

        showCreateFields: function(type, options) {
            var createContainer = this.$("." + type + " .create_container");
            createContainer.removeClass("hidden");
            this.$("." + type + " label").removeClass("hidden");
            this.$("." + type + " .new_" + type).addClass("hidden");

            if (options && options.showCancelLink) {
                createContainer.addClass("show_cancel_link");
            } else {
                createContainer.removeClass("show_cancel_link");
            }
        },

        updateFor: function(type) {
            var select = this.resetSelect(type);
            this.$("."+type+" .loading_text").addClass('hidden');
            this.$("."+type+" label").removeClass("hidden");
            var collection = this[type + "s"];
            if (collection.length) {
                // don't modify the original collection array object
                var models = _.clone(collection.models);
                models.sort(function(a, b) {
                    return naturalSort(a.get("name").toLowerCase(), b.get("name").toLowerCase());
                });

                _.each(models, function(model) {
                    select.append(
                        $("<option/>", {value : model.get("id")}).text(model.get("name"))
                    );
                });
                this.showSelect(type);
            } else {
                this.$("." + type + " .unavailable").show();
            }
        }
    });
})(chorus);
