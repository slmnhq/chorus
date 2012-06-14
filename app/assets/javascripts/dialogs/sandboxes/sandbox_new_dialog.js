chorus.dialogs.SandboxNew = chorus.dialogs.Base.extend({
    constructorName: "SandboxNew",

    templateName: "sandbox_new",
    title: t("sandbox.new_dialog.title"),

    persistent: true,

    events: {
        "click input[value='within_instance']": "showInstanceMode",
        "click input[value='as_standalone']": "showStandaloneMode",
        "click button.submit": "save"
    },

    subviews: {
        "form > .instance_mode": "instanceMode",
        "form > .standalone_mode": "standaloneMode"
    },

    setup: function() {
        this.instanceMode = new chorus.views.SchemaPicker({allowCreate: true});
        this.instanceMode.bind("change", this.enableOrDisableSaveButton, this);
        this.bindings.add(this.instanceMode, "error", this.showErrors);
        this.bindings.add(this.instanceMode, "clearErrors", this.clearErrors);

        this.aurora = chorus.models.Instance.aurora();
        this.bindings.add(this.aurora, "loaded", this.fetchTemplates, this);
        this.aurora.fetch();

        this.requiredResources.add(this.aurora);
        this.requiredResources.add(chorus.models.Config.instance());

        this.standaloneMode = new chorus.views.SandboxNewStandaloneMode({addingSandbox: true});
        this.activeForm = this.instanceMode;
    },

    fetchTemplates: function() {
        if (this.aurora.isInstalled()) {
            this.templates = chorus.models.Instance.auroraTemplates();
            this.bindings.add(this.templates, "loaded", this.templatesLoaded, this);
            this.templates.fetch();
            this.render();
        }
    },

    templatesLoaded: function() {
        var $select = $("<select name='template' class='instance_size'></select>");
        _.each(this.templates.models, function(template) {
            var $option = $("<option></option>").val(template.name()).text(template.toText());
            $select.append($option);
        });

        this.$(".instance_size_container").append($select);
        chorus.styleSelect(this.$("select.instance_size"));
    },

    makeModel: function() {
        this._super("makeModel", arguments);
        var workspaceId = this.options.launchElement.data("workspaceId");
        this.model = new chorus.models.Sandbox({ workspaceId: workspaceId });
        this.bindings.add(this.model, "saved", this.saved);
        this.bindings.add(this.model, "saveFailed", this.saveFailed);
        this.bindings.add(this.model, "validationFailed", this.saveFailed);
    },

    resourcesLoaded: function() {
        this.model.maximumSize = chorus.models.Config.instance().get("provisionMaxSizeInGB");
    },

    additionalContext: function() {
        return { configured: this.aurora.isInstalled() };
    },

    save: function(e) {
        this.$("button.submit").startLoading("sandbox.adding_sandbox");
        if (this.model.save(this.activeForm.fieldValues()) !== false && this.activeForm == this.standaloneMode) {
            chorus.toast("instances.new_dialog.provisioning")
        }
    },

    saved: function() {
        if (this.activeForm != this.standaloneMode) {
            chorus.toast("sandbox.create.toast");
        }
        if (!this.options.launchElement.data("noReload")) {
            chorus.router.reload();
        }
        this.closeModal();
    },

    saveFailed: function() {
        this.$("button.submit").stopLoading();
    },

    enableOrDisableSaveButton: function(schemaVal) {
        this.$("button.submit").prop("disabled", !schemaVal);
    },

    showInstanceMode: function() {
        this.$(".instance_mode").removeClass("hidden");
        this.$(".standalone_mode").addClass("hidden");

        this.activeForm = this.instanceMode;
        this.enableOrDisableSaveButton(this.instanceMode.ready())
    },

    showStandaloneMode: function() {
        this.$(".instance_mode").addClass("hidden");
        this.$(".standalone_mode").removeClass("hidden");

        this.activeForm = this.standaloneMode;
        this.enableOrDisableSaveButton(true);
    }
});
