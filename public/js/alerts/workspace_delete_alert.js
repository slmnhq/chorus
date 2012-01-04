(function($, ns) {
    ns.alerts.WorkspaceDelete = ns.alerts.ModelDelete.extend({
        text : t("workspace.delete.text"),
        title : t("workspace.delete.title"),
        ok : t("workspace.delete.button"),
        redirectUrl : "/",

        makeModel : function(options) {
            this._super("makeModel", options);
            this.model = this.model || this.pageModel;
        },

        modelDeleted : function() {
            ns.toast("workspace.delete.toast", {workspaceName: this.model.get("name")});
            this._super("modelDeleted");
        }
    });
})(jQuery, chorus);
