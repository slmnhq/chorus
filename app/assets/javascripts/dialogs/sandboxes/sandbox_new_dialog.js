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

        this.workspace.fetch();

        this.requiredResources.add(this.workspace);
        this.requiredResources.add(this.aurora);
        this.requiredResources.add(chorus.models.Config.instance());

        this.standaloneMode = new chorus.views.SandboxNewStandaloneMode({addingSandbox: true});
        this.activeForm = this.instanceMode;

        this.bindings.add(this.workspace, "saved", this.saved);
        this.bindings.add(this.workspace, "saveFailed", this.saveFailed);
        this.bindings.add(this.workspace, "validationFailed", this.saveFailed);
    },

    fetchTemplates: function() {
        if (this.aurora.isInstalled()) {
            this.templates = chorus.models.GreenplumInstance.auroraTemplates();
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
        var workspaceId = this.options.workspaceId;
        this.workspace = new chorus.models.Workspace({id : workspaceId});
        this.model = new chorus.models.Sandbox({ workspaceId: workspaceId });
    },

    resourcesLoaded: function() {
        this.model.maximumSize = chorus.models.Config.instance().get("provisionMaxSizeInGB");
    },

    additionalContext: function() {
        return { configured: this.aurora.isInstalled() };
    },

    save: function(e) {
        this.$("button.submit").startLoading("sandbox.adding_sandbox");
        var sandboxId  = this.activeForm.schemaId();
        var summary = !!this.workspace.get("summary") ? this.workspace.get("summary") : ""; // Necessary because backend treats null as string "null"
        this.workspace.set({ summary: summary }, {silent: true})

        if(sandboxId) {
            this.workspace.unset("schemaName",  {silent : true});
            this.workspace.unset("databaseId",  {silent : true});
            this.workspace.unset("databaseName",  {silent : true});
            this.workspace.unset("instanceId",  {silent : true});
            this.workspace.set({ sandboxId: sandboxId }, {silent : true});
            this.workspace.save();
        } else {
            // Create new schema / database
            var schemaName = this.activeForm.fieldValues().schemaName;
            var databaseName = this.activeForm.fieldValues().databaseName;
            var instanceId = this.activeForm.fieldValues().instance;
            var databaseId = this.activeForm.fieldValues().database;
            this.workspace.set({schemaName: schemaName,
                                databaseId: databaseId,
                                databaseName: databaseName,
                                instanceId: instanceId}, {silent : true});
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
        if (!this.options.noReload) {
            chorus.router.reload();
        }
        this.closeModal();
    },

    saveFailed: function() {
        this.$("button.submit").stopLoading();
        this.showErrors(this.workspace);
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
