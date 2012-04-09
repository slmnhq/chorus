chorus.dialogs.DatasetsAttach = chorus.dialogs.PickItems.extend({
    title: t("dataset.attach"),
    constructorName: "DatasetsAttachDialog",
    submitButtonTranslationKey: "actions.dataset_attach",
    emptyListTranslationKey: "dataset.none",
    searchPlaceholderKey: "dataset.dialog.search",
    selectedEvent: 'datasets:selected',
    modelClass: "Dataset",
    pagination: true,

    makeModel: function() {
        this.collection = new chorus.collections.DatasetSet([], {workspaceId: this.options.workspaceId});
        this.collection.fetch();
    },

    collectionModelContext: function (model) {
        return {
            name: model.get("objectName"),
            imageUrl: model.iconUrl({size: 'medium'})
        }
    }
})