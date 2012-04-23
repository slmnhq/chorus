chorus.views.SchemaList = chorus.views.SelectableList.extend({
    templateName: "schema_list",
    eventName: "schema",

    collectionModelContext: function(model) {
        return {
            showUrl: model.showUrl()
        }
    }
});
