chorus.dialogs.DatasetsPicker = chorus.dialogs.PickItems.extend({
    title: t("dataset.pick"),
    constructorName: "DatasetsPickerDialog",
    submitButtonTranslationKey: "actions.dataset_select",
    emptyListTranslationKey: "dataset.none",
    searchPlaceholderKey: "dataset.dialog.search_table",
    selectedEvent: 'datasets:selected',
    modelClass: "Table",
    pagination: true,
    multiSelection: false,
    serverSideSearch: true,

    makeModel: function() {
        this._super("makeModel", arguments);
        this.collection = new chorus.collections.DatasetSet([], {
            workspaceId: this.options.workspaceId,
            type: "SANDBOX_TABLE",
            objectType: "BASE_TABLE"
        });
        this.collection.sortAsc("objectName");
        this.collection.fetch();
    },

    collectionModelContext: function (model) {
        return {
            name: model.get("objectName"),
            imageUrl: model.iconUrl({size: 'medium'})
        }
    },
});