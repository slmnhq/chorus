chorus.dialogs.CreateExternalTableFromHdfs = chorus.dialogs.NewTableImportCSV.extend({
    title: t("hdfs.create_external.title"),
    ok: t("hdfs.create_external.ok"),


    setup: function() {
        this._super("setup", arguments);

        this.workspaces = new chorus.collections.WorkspaceSet([], {userId: chorus.session.user().id});
        this.workspaces.fetch();
        this.requiredResources.push(this.workspaces);
    }
});