;
(function(ns) {
    ns.dialogs.SandboxNew = ns.dialogs.Base.extend({
        className : "sandbox_new",
        title: t("sandbox.new_dialog.title"),

        persistent: true,

        events : {
            "change .instance select" : "instanceSelected",
            "change .database select" : "databaseSelected",
            "change .schema select" : "schemaSelected",
            "click button.submit" : "save"
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

        updateInstances: updateFor('instance'),

        instanceSelected : function() {
            this.resetSelect('database');
            this.resetSelect('schema');
            this.selectedInstance = this.instances.get(this.$('.instance select option:selected').val());
            if (this.selectedInstance) {
                this.databases = this.selectedInstance.databases();
                this.databases.bind("reset", this.updateDatabases, this);
                this.$(".database label").removeClass("hidden");
                this.$('.database .loading_text').removeClass('hidden');
                this.databases.fetch();
            }
        },

        updateDatabases : updateFor('database'),

        databaseSelected : function() {
            this.resetSelect('schema');
            this.selectedDatabase = this.databases.get(this.$('.database select option:selected').val());
            if (this.selectedDatabase) {
                this.schemas = this.selectedDatabase.schemas();
                this.schemas.bind("reset", this.updateSchemas, this);
                this.$(".schema label").removeClass("hidden");
                this.$('.schema .loading_text').removeClass('hidden');
                this.schemas.fetch();
            }
        },

        updateSchemas : updateFor('schema'),

        schemaSelected: function() {
            this.selectedSchema = this.schemas.get(this.$('.schema select option:selected').val());
            if (this.selectedSchema) {
                this.$('button.submit').prop('disabled', false);
            } else {
                this.$('button.submit').prop('disabled', "disabled");
            }
        },

        showSelect : function(type) {
            this.$("." + type + " .select_container").show();
            var select = this.$("." + type + " select");
            select.chosen();
            select.trigger("liszt:updated");
        },

        resetSelect: function(type) {
            this.$("button.submit").prop("disabled", "disabled");
            this.$("."+type+" label").addClass("hidden");

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
            this.pageModel.trigger("invalidated");
            this.closeModal();
        },

        saveFailed: function() {
            this.$("button.submit").stopLoading();
        }
    });

    function updateFor(type) {
        return function() {
            var select = this.resetSelect(type);
            this.$("."+type+" .loading_text").addClass('hidden');
            this.$("."+type+" label").removeClass("hidden");
            var models = this[type + "s"];
            if (models.length) {
                models.each(function(model) {
                    select.append(
                        $("<option/>", {value : model.get("id")}).text(model.get("name"))
                    );
                });
                this.showSelect(type);
            } else {
                this.$("." + type + " .unavailable").show();
            }
        }
    }
})(chorus);
