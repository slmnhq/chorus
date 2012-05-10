chorus.dialogs.HdfsInstanceWorkspacePicker = chorus.dialogs.PickWorkspace.extend({
    constructorName: "HdfsInstanceWorkspacePicker",

    title: t("hdfs_instance.workspace_picker.title"),
    submitButtonTranslationKey: "hdfs_instance.workspace_picker.button",

    setup: function() {
        this.requiredResources.add(this.collection);
        this._super("setup", arguments);
    },

    resourcesLoaded: function() {
        this.render();    
    },

    submit : function() {
        this.trigger("workspace:selected", this.selectedItem());
        this.closeModal();
    }
});