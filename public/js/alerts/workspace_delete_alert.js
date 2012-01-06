(function($, ns) {
    ns.alerts.WorkspaceDelete = ns.alerts.ModelDelete.extend({
        text : t("workspace.delete.text"),
        title : t("workspace.delete.title"),
        ok : t("workspace.delete.button"),
        redirectUrl : "/",
        deleteMessage: "workspace.delete.toast",

        deleteMessageParams : function() {
            return {
                workspaceName : this.model.get("name")
            }
        },

        makeModel : function() {
            this._super("makeModel", arguments);
            this.model = this.model || this.pageModel;
        }
    });
})(jQuery, chorus);
