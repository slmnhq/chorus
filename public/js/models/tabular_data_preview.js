chorus.models.TabularDataPreview = chorus.models.Base.extend(_.extend({}, chorus.Mixins.SQLResults, {
    urlTemplate: function() {
        if (this.get("tableName")) {
            return "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/table/{{tableName}}/sample";
        } else if (this.get("viewName")) {
            return "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/view/{{viewName}}/sample";
        } else {
            return "workspace/{{workspaceId}}/dataset/{{datasetId}}/sample"
        }
    }
}));