chorus.alerts.WorkfileDelete = chorus.alerts.ModelDelete.extend({
    constructorName: "WorkfileDelete",

    text:t("workfile.delete.text"),
    ok:t("workfile.delete.button"),
    deleteMessage:"workfile.delete.toast",


    makeModel:function () {
        this.model = this.model || new chorus.models.Workfile({
            id:this.options.workfileId,
            fileName:this.options.workfileName,
            workspace: { id: this.options.workspaceId }
        });
    },

    setup:function () {
        this.title = t("workfile.delete.title", {workfileTitle:this.model.get("fileName")});
        this.redirectUrl = this.model.workspace().workfilesUrl();
    }
});
