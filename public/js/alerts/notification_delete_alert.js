chorus.alerts.NotificationDeleteAlert = chorus.alerts.ModelDelete.extend({
    ok: t("notification.delete.ok"),
    title: t("notification.delete.title"),
    text: t("notification.delete.text"),
    deleteMessage: "notification.delete.success",

    makeModel: function() {
        this._super("makeModel", arguments);
        var activityModel = this.options.launchElement.data("activity");
        this.model = new chorus.models.Notification({id: activityModel.get("id")});
    },

    modelDeleted: function() {
        this._super("modelDeleted");
        chorus.PageEvents.broadcast("notification:deleted");
    }
});
