chorus.dialogs.ImportGnipStream = chorus.dialogs.Base.extend({
    templateName: "import_gnip_stream",
    title: t("gnip.import_stream.title"),

    events: {
        "click a.select_workspace" : "launchWorkspacePicker"
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
    }
});