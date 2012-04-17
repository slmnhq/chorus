chorus.views.DatabaseList = chorus.views.SelectableList.extend({
    className: "database_list",
    useLoadingSection: true,
    eventName: "database",

    setup: function() {
        this._super("setup", arguments);

        chorus.PageEvents.subscribe("database:search", function() {
            this.selectItem(this.$("li:not(:hidden)").eq(0));
        }, this);
    },

    collectionModelContext: function(model) {
        return {
            showUrl: model.showUrl()
        }
    }
});
