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
            ns.models.Instance.aurora().bind("loaded", this.fetchConfig, this);
            ns.models.Instance.aurora().fetch();
        },

        fetchConfig : function() {
            this.config = new ns.models.Config();
            this.config.bind("loaded", this.createSubViews, this);
            this.config.fetch();
        },

        createSubViews : function() {
            this.setMaxSize();
            this.instanceMode = new ns.views.SandboxNewInstanceMode();
            this.instanceMode.bind("change", this.enableOrDisableSaveButton, this);

            this.standaloneMode = new ns.views.SandboxNewStandaloneMode();
            this.render();
        },

        postRender : function() {
            this.displayMaxSize();
        },

        additionalContext: function() {
            return { configured: ns.models.Instance.aurora().isInstalled() }
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
            this.model.bind("validationFailed", this.saveFailed, this);
        },

        save: function(e) {
            this.$("button.submit").startLoading("sandbox.adding_sandbox");
            this.sandboxType = this.$("input:radio[name='sandbox_type']:checked").val();
            var currentForm = (this.sandboxType === 'within_instance') ? this.instanceMode : this.standaloneMode;
            this.model.save(currentForm.fieldValues());
        },

        saved: function() {
            if(this.sandboxType === 'within_instance') {
                ns.toast("sandbox.create.toast");
            } else {
                ns.toast("sandbox.create.standalone.toast");
            }
            this.pageModel.fetch();
            this.pageModel.trigger("invalidated");
            this.closeModal();
        },

        saveFailed: function() {
            this.$("button.submit").stopLoading();
        },

        setMaxSize : function() {
            this.model.maximumSize = this.config.get("provisionMaxSizeInGB");
            this.displayMaxSize();
        },

        displayMaxSize : function() {
            if (this.config && this.config.get("provisionMaxSizeInGB")) {
                this.$(".max_size").text(t("sandbox.create_standalone_dialog.max_size", { size : this.config.get("provisionMaxSizeInGB")}));
            }
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
