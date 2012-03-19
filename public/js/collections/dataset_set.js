chorus.collections.DatasetSet = chorus.collections.Base.extend({
    model:chorus.models.Dataset,
    urlTemplate:function() {
        if (this.attributes.workspaceId) {
            return "workspace/{{workspaceId}}/dataset{{#if type}}?type={{type}}{{/if}}"
        } else {
            return "data/{{instanceId}}/database/{{encode databaseName}}/schema/{{encode schemaName}}";
        }
    },

    urlParams: function() {
        if (this.attributes.workspaceId){
            return {}
        } else {
            return {type: "meta"}
        }
    },

    comparator: function(dataset) {
        return dataset.get("objectName").toLowerCase();
    }
});