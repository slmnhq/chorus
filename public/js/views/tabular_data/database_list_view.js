chorus.views.DatabaseList = chorus.views.SelectableList.extend({
    className: "database_list",
    useLoadingSection: true,

    setup: function() {
        this.requiredResources.push(this.collection);
    },

    itemSelected: function(model) {
        chorus.PageEvents.broadcast("database:selected", model);
    },

    collectionModelContext: function(model) {
        return {
            showUrl: model.showUrl()
        }
    }
});