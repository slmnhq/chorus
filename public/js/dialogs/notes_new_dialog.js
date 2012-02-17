chorus.dialogs.NotesNew = chorus.dialogs.MemoNew.extend({
    title:t("notes.new_dialog.title"),
    submitButton: t("notes.button.create"),

    makeModel:function () {
        this.model = new chorus.models.Comment({
            entityType:this.options.launchElement.data("entity-type"),
            entityId:this.options.launchElement.data("entity-id"),
            workspaceId: this.options.launchElement.data("workspace-id")
        });
        var subject = this.options.launchElement.data("displayEntityType") || this.model.get("entityType");
        
        this.placeholder = t("notes.placeholder", {noteSubject: subject});
        this._super("makeModel", arguments);
    }
});