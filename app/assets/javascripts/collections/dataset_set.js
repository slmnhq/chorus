chorus.collections.DatasetSet = chorus.collections.LastFetchWins.extend({
    // TODO: Split this class into DatasetSetSearch and DatasetSet (for saving and fetching only)
    model:chorus.models.Dataset,
    constructorName: "DatasetSet",

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

    urlParams: function() {
        var ids = _.pluck(this.models, 'id');
        var params = {
            namePattern: this.attributes.namePattern,
            databaseName: this.attributes.databaseName,
            type: this.attributes.type,
            objectType: this.attributes.objectType,
            'datasetIds[]': ids
        };

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
