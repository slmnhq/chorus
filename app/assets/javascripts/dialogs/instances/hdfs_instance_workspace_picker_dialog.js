chorus.dialogs.HdfsInstanceWorkspacePicker = chorus.dialogs.PickWorkspace.extend({
    constructorName: "HdfsInstanceWorkspacePicker",

    title: t("hdfs_instance.workspace_picker.title"),
    submitButtonTranslationKey: "hdfs_instance.workspace_picker.button",

    setup: function() {
        this.requiredResources.add(this.collection);
        this._super("setup", arguments);
    },

    resourcesLoaded: function() {
        this.render();    
    },

    submit : function() {
        this.sandboxVersion = new chorus.models.SandboxVersion({ workspaceId : this.selectedItem().id});

        this.bindings.add(this.sandboxVersion, "fetchFailed", this.showDialogError);
        this.bindings.add(this.sandboxVersion, "loaded", this.checkVersion);
        this.sandboxVersion.fetch();

        this.trigger("workspace:selected", this.selectedItem());
    },

    showDialogError : function(error) {
        this.model.serverErrors = error || this.sandboxVersion.serverErrors;
        this.render();
    },

    checkVersion : function() {
        var dbVersion = this.sandboxVersion.get("sandboxInstanceVersion");
        var dbCompare = parseFloat(dbVersion.substring(0,3));
        if(dbCompare < 4.2) {
            var error = [{ message: t("hdfs_instance.gpdb_version.too_old")}];
            this.showDialogError(error);
        } else {
            this.model.serverErrors = [];
        }
    }
});