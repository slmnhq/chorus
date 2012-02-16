chorus.alerts.DeleteNoteConfirmAlert = chorus.alerts.ModelDelete.extend({
    makeModel: function() {
        this._super("makeModel", arguments);

        var entityId = this.options.launchElement.data("entityId")
        var entityType = this.options.launchElement.data("entityType")
        var commentId = this.options.launchElement.data("commentId")

        if (entityId && entityType) {
            this.model = new chorus.models.Comment({ id: commentId,
                entityType: entityType,
                entityId: entityId
            })
            this.setComment()
        } else {
            var model = this.options.launchElement.data("activity");

            this.model = new chorus.models.Comment({ id: model.id,
                entityType: model.collection.attributes.entityType,
                entityId: model.collection.attributes.entityId
            });
            if (model.get("type") == "NOTE") {
                this.setNote();
            } else {
                this.setInsight();
            }
        }
    },

    modelDeleted: function() {
        this._super("modelDeleted")
        this.options.pageModel.trigger("invalidated")
    },

    setComment: function() {
        this.text = t("comments.delete.alert.text")
        this.title = t("comments.delete.alert.title")
        this.ok = t("comments.delete.alert.ok")
        this.deleteMessage = "comments.delete.alert.delete_message"
    },

    setNote: function() {
        this.text = t("notes.delete.alert.text")
        this.title = t("notes.delete.alert.title")
        this.ok = t("notes.delete.alert.ok")
        this.deleteMessage = "notes.delete.alert.delete_message"
    },

    setInsight: function() {
        this.text = t("insight.delete.alert.text")
        this.title = t("insight.delete.alert.title")
        this.ok = t("insight.delete.alert.ok")
        this.deleteMessage = "insight.delete.alert.delete_message"
    }
});
