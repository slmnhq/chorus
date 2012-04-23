chorus.dialogs.ImportDatasetsPicker = chorus.dialogs.PickItems.extend({
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

    events: _.extend({
        "click a.preview_columns": "clickPreviewColumns"
    }, this.events),

    setup: function() {
        this._super("setup");
        this.pickItemsList.templateName = "import_datasets_picker_list";
    },

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
            id: model.get("id"),
            name: model.get("objectName"),
            imageUrl: model.iconUrl({size: 'medium'})
        }
    },

    clickPreviewColumns: function(e) {
        e && e.preventDefault();

        var clickedId = $(e.target).closest("li").data("id");
        var databaseObject = this.collection.get(clickedId);

        var previewColumnsDialog = new chorus.dialogs.PreviewColumns({model: databaseObject});
        previewColumnsDialog.title = this.title;
        this.launchSubModal(previewColumnsDialog);
    }
});
