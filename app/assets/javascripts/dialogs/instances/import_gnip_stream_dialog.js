chorus.dialogs.ImportGnipStream = chorus.dialogs.Base.extend({
    templateName: "import_gnip_stream",
    title: t("gnip.import_stream.title"),

    events: {
        "click a.select_workspace" : "launchWorkspacePicker",
        "click .submit" : "saveModel"
    },

    makeModel: function() {
        this.resource = this.model = new chorus.models.GnipStream();
    },

    launchWorkspacePicker: function() {
        this.workspace_picker = new chorus.dialogs.ImportStreamWorkspacePicker();
        this.workspace_picker.launchModal();
        this.bindings.add(this.workspace_picker, "workspace:selected", this.workspaceSelected);
    },

    workspaceSelected: function(workspace){
        this.workspace = workspace;
        this.$("a.select_workspace").text(this.workspace.name());
        this.$("a.select_workspace").attr("title", this.workspace.name());
    },

    saveModel: function() {
        this.setFieldValues();
        this.model.save();
    },

    setFieldValues: function() {
        this.model.set({
            workspaceId: this.workspace && this.workspace.id,
            toTable: this.$("input[name=toTable]").val()
        }, {silent: true});
    }
});