chorus.dialogs.DatasetsAttach = chorus.dialogs.Attach.extend({
    submitButtonTranslationKey: "actions.dataset_attach",
    title: t("dataset.attach"),
    collectionClass:chorus.collections.DatasetSet,
    selectedEvent: 'datasets:selected',

    makeModel: function() {
        this.collection = new chorus.collections.DatasetSet([], {workspaceId: this.options.workspaceId});
        this.collection.fetchAll();
    },

    collectionModelContext: function (model) {
        return {
            iconUrl: model.iconUrl({size: 'small'}),
            name: model.get("objectName")
        }
    }
})