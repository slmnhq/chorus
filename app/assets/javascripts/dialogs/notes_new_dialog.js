chorus.dialogs.NotesNew = chorus.dialogs.MemoNew.extend({
    constructorName: "NotesNew",

    title:t("notes.new_dialog.title"),
    submitButton: t("notes.button.create"),

    makeModel: function() {
        this.model = new chorus.models.Note({
            entityId:    this.options.entityId,
            entityType:  this.options.entityType,
            workspaceId: this.options.workspaceId
        });

        this.pageModel = this.options.pageModel;

        var subject = this.options.displayEntityType || this.options.entityType;
        this.placeholder = t("notes.placeholder", {noteSubject: subject});
        this._super("makeModel", arguments);
    }
});
