chorus.dialogs.HdfsInstanceWorkspacePicker = chorus.dialogs.PickWorkspace.extend({
    constructorName: "HdfsInstanceWorkspacePicker",

    title: t("hdfs_instance.workspace_picker.title"),
    submitButtonTranslationKey: "hdfs_instance.workspace_picker.button",

    setup: function() {
        this.requiredResources.add(this.collection);
        this._super("setup", arguments);
        chorus.PageEvents.subscribe("csv_import:started", this.closeDialog, this);
    },

    resourcesLoaded: function() {
        this.render();    
    },

    closeDialog: function() {
        this.closeModal();
    },

    submit : function() {
        this.sandboxVersion = new chorus.models.SandboxVersion({ workspaceId : this.selectedItem().id});

        this.bindings.add(this.sandboxVersion, "fetchFailed", this.showDialogError);
        this.bindings.add(this.sandboxVersion, "loaded", this.checkVersion);
        this.sandboxVersion.fetch();

        this.trigger("workspace:selected", this.selectedItem());
    },

    showDialogError : function(errorText) {
        this.model.serverErrors = errorText.serverErrors ? errorText.serverErrors :  [{ message : errorText }];
        this.render();
    },

    checkVersion : function() {
        var dbVersion = this.sandboxVersion.get("sandboxInstanceVersion");
        var dbCompare = parseFloat(dbVersion.substring(0,3));
        if(dbCompare < 4.2) {
            this.showDialogError(t("hdfs_instance.gpdb_version.too_old"));
        } else {

            this.model.serverErrors = [];

            var path = this.model.get("path");
            var separator = (path == "/") ? "" : "/";

            this.hdfsFiles = new chorus.collections.CsvHdfsFileSet([], {
                instance : this.model.get("instance"),
                path : path + separator + this.model.get("name")
            });

            this.hdfsFiles.bindOnce("loaded", this.launchCreateHdfsDialog, this)
            this.hdfsFiles.fetchAll();

        }
    },

    launchCreateHdfsDialog : function() {
        var hdfsTextFiles = this.hdfsFiles.filesOnly();

        if (hdfsTextFiles.length == 0) {
            this.showDialogError(t("hdfs_instance.no_text_files"))
        } else {
            this.externalTableDialog = new chorus.dialogs.CreateDirectoryExternalTableFromHdfs({
            collection: hdfsTextFiles || [],
            directoryName : this.model.get("name"),
            workspaceId : this.selectedItem().id,
            workspaceName: this.selectedItem().get("name")
        });

        this.externalTableDialog.csv.fetch();
        this.externalTableDialog.csv.onLoaded(function() {
            this.launchSubModal(this.externalTableDialog);
        }, this);

        }

    }
});