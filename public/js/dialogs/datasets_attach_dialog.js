chorus.dialogs.DatasetsAttach = chorus.dialogs.Attach.extend({
    submitButtonTranslationKey: "actions.dataset_attach",
    emptyListTranslationKey: "dataset.none",
    title: t("dataset.attach"),
    collectionClass:chorus.collections.DatasetSet,
    selectedEvent: 'datasets:selected',
    searchPlaceholderKey: "dataset.dialog.search",

    makeModel: function() {
        this.collection = new chorus.collections.DatasetSet([], {workspaceId: this.options.workspaceId});
        this.collection.fetchAll();
    },

    picklistCollectionModelContext: function (model) {
        return {
            name: model.get("objectName"),
            imageUrl: model.iconUrl({size: 'medium'})
        }
    }
})