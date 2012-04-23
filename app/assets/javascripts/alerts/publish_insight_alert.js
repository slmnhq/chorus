chorus.alerts.PublishInsight = chorus.alerts.Base.extend({
    constructorName: "PublishInsight",

    setup: function(options){
        this.publish = options.publish;
        this.text = this.publish ? t("insight.publish.alert.body") : t("insight.unpublish.alert.body")
        this.title = this.publish ? t("insight.publish.alert.title") : t("insight.unpublish.alert.title"),
        this.ok = this.publish ? t("insight.publish.alert.button") : t("insight.unpublish.alert.button")
    },

    confirmAlert:function () {
        this.publish ? this.model.publish() : this.model.unpublish();
        $(document).trigger("close.facebox");
    }
});
