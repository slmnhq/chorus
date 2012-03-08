chorus.views.DatabaseList = chorus.views.SelectableList.extend({
    className: "database_list",

    itemSelected: function(model) {
        chorus.PageEvents.broadcast("database:selected", model);
    },

    collectionModelContext: function(model) {
        return {
            showUrl: model.showUrl()
        }
    }
});