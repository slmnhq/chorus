chorus.views.SchemaList = chorus.views.SelectableList.extend({
    className: "schema_list",
    eventName: "schema",

    collectionModelContext: function(model) {
        return {
            showUrl: model.showUrl()
        }
    }
});
