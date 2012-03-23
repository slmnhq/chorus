chorus.views.DatabaseList = chorus.views.SelectableList.extend({
    className: "database_list",
    useLoadingSection: true,
    eventName: "database",

    collectionModelContext: function(model) {
        return {
            showUrl: model.showUrl()
        }
    }
});
