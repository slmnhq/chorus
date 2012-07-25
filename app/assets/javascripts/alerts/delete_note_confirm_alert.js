chorus.alerts.DeleteNoteConfirmAlert = chorus.alerts.ModelDelete.extend({
    constructorName: "DeleteNoteConfirmAlert",

    makeModel: function() {
        this._super("makeModel", arguments);

        var entityId = this.options.entityId;
        var entityType = this.options.entityType;
        var commentId = this.options.commentId;

        if (entityId && entityType) {
            this.model = new chorus.models.Comment({
                id: commentId,
                entityType: entityType,
                entityId: entityId
            });
            this.setComment()
        } else {
            var activity = this.options.activity;
            this.model = activity.toNote();

            if (activity.isInsight()) {
                this.setInsight();
            } else {
                this.setNote();
            }
        }
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
