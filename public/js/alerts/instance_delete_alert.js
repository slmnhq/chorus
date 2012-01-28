chorus.alerts.InstanceDelete = chorus.alerts.ModelDelete.extend({
    text:t("instances.delete.text"),
    title:t("instances.delete.title"),
    ok:t("actions.delete"),
    deleteMessage:"instances.delete.toast",

    makeModel:function () {
        this.model = this.options.pageModel
    }
})