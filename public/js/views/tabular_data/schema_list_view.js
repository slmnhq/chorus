chorus.views.SchemaList = chorus.views.SelectableList.extend({
    className: "schema_list",

    itemSelected: function(model) {
        chorus.PageEvents.broadcast("schema:selected", model);
    },

    collectionModelContext: function(model) {
        return {
            showUrl: model.showUrl()
        }
    }
});