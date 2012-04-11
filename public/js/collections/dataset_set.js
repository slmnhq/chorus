chorus.collections.DatasetSet = chorus.collections.LastFetchWins.extend({
    model:chorus.models.Dataset,
    urlTemplate:function() {
        if (this.attributes.workspaceId) {
            return "workspace/{{workspaceId}}/dataset";
        } else {
            return "data/{{instanceId}}/database/{{encode databaseName}}/schema/{{encode schemaName}}";
        }
    },

    urlParams: function() {
        var params = {
            namePattern: this.attributes.namePattern,
            databaseName: this.attributes.databaseName,
            type: this.attributes.type,
            objectType: this.attributes.objectType
        };

        if (!this.attributes.workspaceId) {
            params.type = "meta";
        }
        return params;
    },

    comparator: function(dataset) {
        return dataset.get("objectName").toLowerCase();
    },

    search: function(term) {
        var self = this;
        self.attributes.namePattern = term;
        self.fetch({silent: true, success: function() { self.trigger('searched'); }});
    }
});
