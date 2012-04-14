chorus.views.DatabaseList = chorus.views.SelectableList.extend({
    templateName: "database_list",
    useLoadingSection: true,
    eventName: "database",

    collectionModelContext: function(model) {
        return {
            showUrl: model.showUrl()
        }
    }
});
