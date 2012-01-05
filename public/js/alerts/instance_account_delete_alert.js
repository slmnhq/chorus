;(function(ns) {
    ns.alerts.InstanceAccountDelete = ns.alerts.ModelDelete.extend({
        redirectUrl : "/instances",
        text: t("instances.account.delete.text"),
        title: t("instances.account.delete.title"),
        ok: t("instances.account.delete.button"),

        makeModel : function() {
            this._super("makeModel", arguments);
            this.model = this.pageModel.accountForCurrentUser();
        },

        modelDeleted : function() {
            ns.toast("instances.account.delete.toast");
            this._super("modelDeleted");
        }
    })
})(chorus);

