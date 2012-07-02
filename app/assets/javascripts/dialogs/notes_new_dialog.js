chorus.dialogs.NotesNew = chorus.dialogs.MemoNew.extend({
    constructorName: "NotesNew",

    title:t("notes.new_dialog.title"),
    submitButton: t("notes.button.create"),

    makeModel: function() {
        this.model = new chorus.models.Note({
            entityId: this.options.launchElement ? this.options.launchElement.data("entity-id") : this.options.entityId,
            entityType: this.options.launchElement ? this.options.launchElement.data("entity-type") : this.options.entityType,
        });

        var subject;
        if (this.options.launchElement) {
            subject = this.options.launchElement.data("displayEntityType") || this.model.get("entityType");
        } else {
            subject = this.model.get("entityType");
        }

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
