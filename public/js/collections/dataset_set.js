chorus.collections.DatasetSet = chorus.collections.LastFetchWins.extend({
    model:chorus.models.Dataset,
    urlTemplate:function() {
        if (this.attributes.workspaceId) {
            return "workspace/{{workspaceId}}/dataset{{#if type}}?type={{type}}{{/if}}"
        } else {
            return "data/{{instanceId}}/database/{{encode databaseName}}/schema/{{encode schemaName}}";
        }
    },

    urlParams: function() {
        var ctx = {namePattern: this.attributes.namePattern};
        if (!this.attributes.workspaceId) {
            ctx.type = "meta";
        }
        return ctx;
    },

    comparator: function(dataset) {
        return dataset.get("objectName").toLowerCase();
    }
});