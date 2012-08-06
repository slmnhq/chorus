chorus.collections.WorkspaceDatasetSet = chorus.collections.LastFetchWins.extend({
    // TODO: Split this class into WorkspaceDatasetSetSearch and WorkspaceDatasetSet (for saving and fetching only)
    model:chorus.models.WorkspaceDataset,
    constructorName: "WorkspaceDatasetSet",

    setup: function() {
        if(this.attributes.unsorted) {
            this.comparator = undefined;
        }
    },

    showUrlTemplate: "workspaces/{{workspaceId}}/datasets",
    urlTemplate: "workspaces/{{workspaceId}}/datasets",

    save: function() {
        new chorus.models.BulkSaver({collection: this}).save();
    },

    urlParams: function(options) {

        var params = {
            namePattern: this.attributes.namePattern,
            databaseName: this.attributes.databaseName,
            type: this.attributes.type,
            objectType: this.attributes.objectType,
        };

        if (options && options.method == "create") {
            var ids = _.pluck(this.models, 'id');
            params['datasetIds'] = ids.toString()
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
    },

    hasFilter: function() {
        return !this.attributes.namePattern == "";
    }
});
