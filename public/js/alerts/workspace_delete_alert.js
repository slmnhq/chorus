(function($, ns) {
    ns.WorkspaceDelete = chorus.alerts.ModelDelete.extend({
        text : t("workspace.delete.text"),
        title : t("workspace.delete.title"),
        ok : t("workspace.delete.button"),
        redirectUrl : "/",

        makeModel : function(options) {
            this._super("makeModel", options);
            this.model = this.model || this.pageModel;
        }
    });
})(jQuery, chorus.alerts);
