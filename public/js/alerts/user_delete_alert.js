;(function(ns) {
    ns.alerts.UserDelete = ns.alerts.ModelDelete.extend({
        redirectUrl : "/users",
        text: t("user.delete.text"),
        title: t("user.delete.title"),
        ok: t("user.delete.button"),

        makeModel : function() {
            this.model = this.model || new chorus.models.User({ id : this.options.launchElement.data("id") });
        }
    })
})(chorus);

