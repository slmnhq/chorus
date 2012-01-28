chorus.alerts.UserDelete = chorus.alerts.ModelDelete.extend({
    redirectUrl:"/users",
    text:t("user.delete.text"),
    title:t("user.delete.title"),
    ok:t("user.delete.button"),
    deleteMessage:"user.delete.toast",

    makeModel:function () {
        this.model = this.model || new chorus.models.User({ id:this.options.launchElement.data("id") });
    }
})