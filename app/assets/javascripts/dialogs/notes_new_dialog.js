chorus.dialogs.NotesNew = chorus.dialogs.MemoNew.extend({
    constructorName: "NotesNew",

    title:t("notes.new_dialog.title"),
    submitButton: t("notes.button.create"),

    makeModel: function() {
        this.model = new chorus.models.Note({
            entityId:    this.options.entityId,
            entityType:  this.options.entityType,
        });

        var subject = this.options.displayEntityType || this.options.entityType;

        this.placeholder = t("notes.placeholder", {noteSubject: subject});

        this.bindings.add(this.model, "saved", this.modelSaved);
        this.bindings.add(this.model, "saveFailed", this.saveFailed);
        this.bindings.add(this.model, "validationFailed", this.saveFailed);
        this.pageModel = this.options.pageModel;
    },

    modelSaved: function() {
        this.saved();
    }
});
