chorus.collections.DatabaseColumnSet = chorus.collections.Base.extend({
    model: chorus.models.DatabaseColumn,

    urlTemplate: function() {
        return "database_objects/{{id}}/columns"
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

    comparator: function(column) {
        if (column.tabularData && column.tabularData.datasetNumber) {
            return (column.tabularData.datasetNumber * 10000) + column.get('ordinalPosition');
        }
        return column.get('ordinalPosition');
    }
});