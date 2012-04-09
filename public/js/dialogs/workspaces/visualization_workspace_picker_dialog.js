chorus.dialogs.VisualizationWorkspacePicker = chorus.dialogs.PickWorkspace.extend({
    title: t("visualization.workspace_picker.title"),
    buttonTitle: t("visualization.workspace_picker.button"),

    setup: function() {
        this.options = this.options || {}
        this.options.activeOnly = true;
        this._super("setup", arguments)
    },

    callback : function() {
        this.trigger("workspace:selected", this.selectedItem());
        this.closeModal();
    }
});