;
(function(ns) {
    ns.dialogs.SandboxNew = ns.dialogs.Base.extend({
        className : "sandbox_new",
        title: t("sandbox.new_dialog.title"),

        persistent: true,

        events : {
            "click button.submit" : "save",
            "keyup input.name"    : "enableOrDisableSaveButton",
            "paste input.name"    : "enableOrDisableSaveButton",
            "click input[value='within_instance']" : "showInstanceMode",
            "click input[value='as_standalone']" : "showStandaloneMode",
        },

        subviews: {
            "form > .instance_mode"   : "instanceMode",
            "form > .standalone_mode" : "standaloneMode"
        },

        setup: function() {
            this.instanceMode = new ns.views.SandboxNewInstanceMode();
            this.instanceMode.bind("change", this.enableOrDisableSaveButton, this);

            this.standaloneMode = new ns.views.SandboxNewStandaloneMode();
        },

        showInstanceMode: function() {
            this.$(".instance_mode").removeClass("hidden");
            this.$(".standalone_mode").addClass("hidden");
        },

        showStandaloneMode: function() {
            this.$(".instance_mode").addClass("hidden");
            this.$(".standalone_mode").removeClass("hidden");
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
            var sandboxType = this.$("input:radio[name='sandbox_type']:checked").val();
            var currentForm = (sandboxType === 'within_instance') ? this.instanceMode : this.standaloneMode;
            this.model.save(currentForm.fieldValues());
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
