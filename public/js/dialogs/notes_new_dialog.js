chorus.dialogs.NotesNew = chorus.dialogs.MemoNew.extend({
    title:t("notes.new_dialog.title"),
    submitButton: t("notes.button.create"),

    makeModel: function() {
        this.model = new chorus.models.Comment({
            entityId: this.options.launchElement ? this.options.launchElement.data("entity-id") : this.options.entityId,
            entityType: this.options.launchElement ? this.options.launchElement.data("entity-type") : this.options.entityType,
            workspaceId: this.options.launchElement ? this.options.launchElement.data("workspace-id") : this.options.workspaceId
        });

        var subject;
        if (this.options.launchElement) {
            subject = this.options.launchElement.data("displayEntityType") || this.model.get("entityType");
        } else {
            subject = this.model.get("entityType");
        }

        this.placeholder = t("notes.placeholder", {noteSubject: subject});
        this._super("makeModel", arguments);
    }
});