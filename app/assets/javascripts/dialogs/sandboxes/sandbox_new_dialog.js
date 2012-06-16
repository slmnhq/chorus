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

        this.aurora = chorus.models.GreenplumInstance.aurora();
        this.bindings.add(this.aurora, "loaded", this.fetchTemplates, this);

//      TODO: when Aurora is done on the backend, comment this back in and un-xit all the specs in sandbox_new_dialog_spec.js (and fix them)
//      this.aurora.fetch();
        this.aurora.loaded = true;

        this.requiredResources.add(this.aurora);
        this.requiredResources.add(chorus.models.Config.instance());

        this.standaloneMode = new chorus.views.SandboxNewStandaloneMode({addingSandbox: true});
        this.activeForm = this.instanceMode;
    },

    fetchTemplates: function() {
        if (this.aurora.isInstalled()) {
            this.templates = chorus.models.GreenplumInstance.auroraTemplates();
            this.bindings.add(this.templates, "loaded", this.templatesLoaded, this);
            this.templates.fetch();
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
        this.workspace = this.pageModel;
        this.model = new chorus.models.Sandbox({ workspaceId: workspaceId });
        this.bindings.add(this.workspace, "saved", this.saved);
        this.bindings.add(this.workspace, "saveFailed", this.saveFailed);
        this.bindings.add(this.workspace, "validationFailed", this.saveFailed);
    },

    resourcesLoaded: function() {
        this.model.maximumSize = chorus.models.Config.instance().get("provisionMaxSizeInGB");
    },

    additionalContext: function() {
        return { configured: this.aurora.isInstalled() };
    },

    save: function(e) {
        this.$("button.submit").startLoading("sandbox.adding_sandbox");
        var sandboxId  = this.activeForm.fieldValues().schema;
        if(sandboxId) {
            this.workspace.set({ sandboxId: sandboxId }, {silent : true});
            this.workspace.save();
        }

        // TODO: possibly put back in for more sandbox stories, i.e. provisioning new sandbox or creating sandbox for new schema?
//        if (this.model.save(this.activeForm.fieldValues()) !== false && this.activeForm == this.standaloneMode) {
//            chorus.toast("instances.new_dialog.provisioning")
//        }
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
