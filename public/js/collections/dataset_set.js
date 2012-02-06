chorus.collections.DatasetSet = chorus.collections.Base.extend({
    model:chorus.models.Dataset,
    urlTemplate:function() {
        if (this.attributes.workspaceId) {
            return "workspace/{{workspaceId}}/dataset"
        } else {
            return "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}";
        }
    }
});