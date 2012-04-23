chorus.collections.DatabaseColumnSet = chorus.collections.Base.extend({
    model: chorus.models.DatabaseColumn,

    urlTemplate: function() {
        if (this.attributes.tableName) {
            return "data/{{instanceId}}/database/{{encode databaseName}}/schema/{{encode schemaName}}/table/{{encode tableName}}/column";
        } else if (this.attributes.viewName) {
            return "data/{{instanceId}}/database/{{encode databaseName}}/schema/{{encode schemaName}}/view/{{encode viewName}}/column";
        } else if (this.attributes.queryName) {
            return "workspace/{{workspaceId}}/dataset/{{queryName}}/column";
        }
    },

    urlParams: function() {
        return {
            type: this.attributes.type
        }
    },

    _prepareModel: function(model, options) {
        model = this._super("_prepareModel", arguments);
        if (this.attributes && this.attributes.tabularData) {
            model.tabularData = this.attributes.tabularData;
            model.initialize();
        }
        return model;
    },

    errorMessage: function() {
        return _.pluck(this.serverErrors, "message").join("\n");
    },

    comparator: function(column) {
        if (column.tabularData && column.tabularData.datasetNumber) {
            return (column.tabularData.datasetNumber * 10000) + column.get('ordinalPosition');
        }
        return column.get('ordinalPosition');
    }
});