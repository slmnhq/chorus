chorus.alerts.WorkfileDelete = chorus.alerts.ModelDelete.extend({
    constructorName: "WorkfileDelete",

    text:t("workfile.delete.text"),
    ok:t("workfile.delete.button"),
    deleteMessage:"workfile.delete.toast",


    makeModel:function () {
        this.model = this.model || new chorus.models.Workfile({
            id:this.options.launchElement.data("workfile-id"),
            workspaceId:this.options.launchElement.data("workspace-id"),
            fileName:this.options.launchElement.data("workfile-name")
        });
    },

    setup:function () {
        this.title = t("workfile.delete.title", {workfileTitle:this.model.get("fileName")});
        this.redirectUrl = this.model.workspace().workfilesUrl();
    }
});
