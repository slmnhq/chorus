chorus.dialogs.AssociateMultipleWithWorkspace = chorus.dialogs.PickWorkspace.extend({
    constructorName: "AssociateWithWorkspace",

    title: t("dataset.associate.title.other"),
    submitButtonTranslationKey: "dataset.associate.button.other",

    setup: function(options) {
        this.databaseObjects = options.databaseObjects;
        this.requiredResources.add(this.collection);
        this._super('setup', arguments);
    },

    submit: function() {
        this._super("submit", arguments);
        this.$("button.submit").startLoading("actions.associating");

        var workspace = this.selectedItem();
        var datasetSet = workspace.datasets();
        datasetSet.reset(this.databaseObjects.models);

        this.bindings.add(datasetSet, "saved", this.saved);

        datasetSet.save();
    },

    saved: function() {
        this.closeModal();
        chorus.toast("dataset.associate.toast.other", {
            workspaceNameTarget: this.selectedItem().get("name"),
            count: this.databaseObjects.length
        });
    }
});
