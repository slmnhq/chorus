chorus.alerts.WorkspaceDelete = chorus.alerts.ModelDelete.extend({
    constructorName: "WorkspaceDelete",

    text:t("workspace.delete.text"),
    title:t("workspace.delete.title"),
    ok:t("workspace.delete.button"),
    redirectUrl:"/",
    deleteMessage:"workspace.delete.toast",

    deleteMessageParams:function () {
        return {
            workspaceName:this.workspaceName
        }
    },

    makeModel:function () {
        this._super("makeModel", arguments);
        this.model = this.model || this.pageModel;
        this.workspaceName = this.model.get("name");
    }
});

