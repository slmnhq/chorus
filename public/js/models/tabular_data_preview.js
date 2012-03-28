chorus.models.TabularDataPreview = chorus.models.Base.include(
    chorus.Mixins.SQLResults
).extend({
    constructorName: "TabularDataPreview",
    urlTemplate: function() {
        if (this.get("tableName")) {
            return "data/{{instanceId}}/database/{{encode databaseName}}/schema/{{encode schemaName}}/table/{{encode tableName}}/sample";
        } else if (this.get("viewName")) {
            return "data/{{instanceId}}/database/{{encode databaseName}}/schema/{{encode schemaName}}/view/{{encode viewName}}/sample";
        } else if(this.get("query")) {
            return "workspace/{{workspaceId}}/dataset?type=preview"
        } else {
            return "workspace/{{workspaceId}}/dataset/{{encode datasetId}}/sample"
        }
    },

    cancel: function() {
    }
});
