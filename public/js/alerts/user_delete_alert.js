;(function(ns) {
    ns.alerts.UserDelete = ns.alerts.ModelDelete.extend({
        redirectUrl : "/users",
        text: t("user.delete.text"),
        title: t("user.delete.title"),
        ok: t("user.delete.button"),

        makeModel : function() {
            this.model = this.model || new chorus.models.User({ userName : this.options.launchElement.data("username") });
        },

    })
})(chorus);

