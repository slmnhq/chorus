chorus.alerts.DeleteNoteConfirmAlert = chorus.alerts.ModelDelete.extend({
    text:t("notes.delete.alert.text"),
    title:t("notes.delete.alert.title"),
    ok:t("notes.delete.alert.ok"),
    deleteMessage:"notes.delete.alert.delete_message",

    makeModel: function () {
        this._super("makeModel", arguments);

        var entityId = this.options.launchElement.data("entityId")
        var entityType = this.options.launchElement.data("entityType")
        var commentId = this.options.launchElement.data("commentId")

        if (entityId && entityType) {
            this.model = new chorus.models.Comment({ id: commentId,
                entityType: entityType,
                entityId: entityId
            })
        } else {
            var model = this.options.launchElement.data("activity");

            this.model = new chorus.models.Comment({ id: model.id,
                entityType: model.collection.attributes.entityType,
                entityId: model.collection.attributes.entityId
            });
        }
    },

    modelDeleted: function() {
        this._super("modelDeleted")
        this.options.pageModel.trigger("invalidated")
    }
});
