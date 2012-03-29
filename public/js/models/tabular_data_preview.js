chorus.models.TabularDataPreview = chorus.models.Base.include(
    chorus.Mixins.SQLResults
).extend({
    constructorName: "TabularDataPreview",
    urlTemplate: function() {
        if (this.get("tableName")) {
            return "data/{{instanceId}}/database/{{encodeOnce databaseName}}/schema/{{encodeOnce schemaName}}/table/{{encodeOnce tableName}}/sample";
        } else if (this.get("viewName")) {
            return "data/{{instanceId}}/database/{{encodeOnce databaseName}}/schema/{{encodeOnce schemaName}}/view/{{encodeOnce viewName}}/sample";
        } else if(this.get("query")) {
            return "workspace/{{workspaceId}}/dataset?type=preview"
        } else {
            return "workspace/{{workspaceId}}/dataset/{{encodeOnce datasetId}}/sample"
        }
    },

    cancel: function() {
    }
});
