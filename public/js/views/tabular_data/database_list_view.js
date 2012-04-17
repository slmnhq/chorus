chorus.views.DatabaseList = chorus.views.SelectableList.extend({
    className: "database_list",
    useLoadingSection: true,
    eventName: "database",

    setup: function() {
        this._super("setup", arguments);
    },

    collectionModelContext: function(model) {
        return {
            showUrl: model.showUrl()
        }
    }
});
