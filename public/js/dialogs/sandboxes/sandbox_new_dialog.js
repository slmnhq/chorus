;
(function(ns) {
    ns.dialogs.SandboxNew = ns.dialogs.Base.extend({
        className : "sandbox_new",
        title: t("sandbox.new_dialog.title"),

        persistent: true,

        events : {
            "click button.submit" : "save",
            "keyup input.name"    : "enableOrDisableSaveButton",
            "paste input.name"    : "enableOrDisableSaveButton"
        },

        subviews: {
            "form > .instance_mode" : "instanceMode"
        },

        setup: function() {
            this.instanceMode = new ns.views.SandboxNewInstanceMode();
            this.instanceMode.bind("change", this.enableOrDisableSaveButton, this);
        },

        makeModel: function() {
            this._super("makeModel", arguments);
            var workspaceId = this.options.launchElement.data("workspaceId");
            this.model = new ns.models.Sandbox({ workspaceId: workspaceId });
            this.model.bind("saved", this.saved, this);
            this.model.bind("saveFailed", this.saveFailed, this);
        },

        save: function(e) {
            this.$("button.submit").startLoading("sandbox.adding_sandbox");
            this.model.save(this.instanceMode.fieldValues());
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

        enableOrDisableSaveButton: function() {
//            var fieldValues = this.instanceMode.fieldValues();
//            var hasSchema = fieldValues.schemaName || fieldValues.schema;
//            var hasDatabase = fieldValues.databaseName || fieldValues.database;
//            if (hasSchema && hasDatabase) {
//                this.$("button.submit").removeAttr("disabled");
//            } else {
//                this.$("button.submit").attr("disabled", "disabled");
//            }
        }
    });
})(chorus);
