chorus.alerts.DeleteNoteConfirmAlert = chorus.alerts.ModelDelete.extend({
    text:t("notes.delete.alert.text"),
    title:t("notes.delete.alert.title"),
    ok:t("notes.delete.alert.ok"),
    deleteMessage:"notes.delete.alert.delete_message",

    makeModel: function () {
        this._super("makeModel", arguments);
        var activity = this.options.launchElement.data("activity");

        this.model = new chorus.models.Comment({ id: activity.id,
            entityType: activity.collection.attributes.entityType,
            entityId: activity.collection.attributes.entityId
        });
    },

    modelDeleted: function() {
        this._super("modelDeleted")
        this.options.pageModel.trigger("invalidated")
    }
});
