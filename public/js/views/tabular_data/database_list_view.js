chorus.views.DatabaseList = chorus.views.SelectableList.extend({
    className: "database_list",
    useLoadingSection: true,

    itemSelected: function(model) {
        chorus.PageEvents.broadcast("database:selected", model);
    },

    collectionModelContext: function(model) {
        return {
            showUrl: model.showUrl()
        }
    }
});