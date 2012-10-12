chorus.dialogs.ImportStreamWorkspacePicker = chorus.dialogs.PickWorkspace.extend({
    constructorName: "ImportStreamWorkspacePicker",
    title: t("gnip.import_stream.select_workspace_title"),
    submitButtonTranslationKey: "gnip.import_stream.select_workspace",

    makeModel: function() {
        this.options = this.options || {}
        this.options.activeOnly = true;
        this._super("makeModel", arguments);
    },

    submit : function() {
        this.trigger("workspace:selected", this.selectedItem());
        this.closeModal();
    }
});
