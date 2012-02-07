chorus.dialogs.SandboxNew = chorus.dialogs.Base.extend({
    className: "sandbox_new",
    title: t("sandbox.new_dialog.title"),

    persistent: true,

    events: {
        "click button.submit": "save",
        "keyup input.name": "enableOrDisableSaveButton",
        "paste input.name": "enableOrDisableSaveButton",
        "click input[value='within_instance']": "showInstanceMode",
        "click input[value='as_standalone']": "showStandaloneMode"
    },

    subviews: {
        "form > .instance_mode": "instanceMode",
        "form > .standalone_mode": "standaloneMode"
    },

    setup: function() {
        chorus.models.Instance.aurora().bind("loaded", this.fetchConfig, this);
        chorus.models.Instance.aurora().fetch();
    },

    fetchConfig: function() {
        this.config = chorus.models.Config.instance();
        this.config.onLoaded(this.createSubViews, this);
    },

    createSubViews: function() {
        this.setMaxSize();
        this.instanceMode = new chorus.views.SchemaPicker({allowCreate: true});
        this.instanceMode.bind("change", this.enableOrDisableSaveButton, this);

        this.standaloneMode = new chorus.views.SandboxNewStandaloneMode();
        this.render();
    },

    postRender: function() {
        this.displayMaxSize();
    },

    additionalContext: function() {
        return { configured: chorus.models.Instance.aurora().isInstalled() }
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
        this.model = new chorus.models.Sandbox({ workspaceId: workspaceId });
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
        if (this.sandboxType === 'within_instance') {
            chorus.toast("sandbox.create.toast");
        } else {
            chorus.toast("sandbox.create.standalone.toast");
        }
        this.pageModel.fetch();
        this.pageModel.trigger("invalidated");
        this.closeModal();
    },

    saveFailed: function() {
        this.$("button.submit").stopLoading();
    },

    setMaxSize: function() {
        this.model.maximumSize = this.config.get("provisionMaxSizeInGB");
        this.displayMaxSize();
    },

    displayMaxSize: function() {
        if (this.config && this.config.get("provisionMaxSizeInGB")) {
            this.$(".max_size").text(t("sandbox.create_standalone_dialog.max_size", { size: this.config.get("provisionMaxSizeInGB")}));
        }
    },

    enableOrDisableSaveButton: function(schemaVal) {
        this.$("button.submit").prop("disabled", !schemaVal);
    }
});