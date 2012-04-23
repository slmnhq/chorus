chorus.dialogs.VisualizationWorkspacePicker = chorus.dialogs.PickWorkspace.extend({
    constructorName: "VisualizationWorkspacePicker",

    title: t("visualization.workspace_picker.title"),
    buttonTitle: t("visualization.workspace_picker.button"),

    setup: function() {
        this.options = this.options || {}
        this.options.activeOnly = true;
        this._super("setup", arguments)
    },

    submit : function() {
        this.trigger("workspace:selected", this.selectedItem());
        this.closeModal();
    }
});
