chorus.collections.DatabaseColumnSet = chorus.collections.Base.extend({
    model: chorus.models.DatabaseColumn,

    urlTemplate: function() {
        return "datasets/{{id}}/columns"
    },

    urlParams: function() {
        return {
            type: this.attributes.type
        }
    },

    _prepareModel: function(model, options) {
        model = this._super("_prepareModel", arguments);
        if (this.attributes && this.attributes.dataset) {
            model.dataset = this.attributes.dataset;
            model.initialize();
        }
        return model;
    },

    comparator: function(column) {
        if (column.dataset && column.dataset.datasetNumber) {
            return (column.dataset.datasetNumber * 10000) + column.get('ordinalPosition');
        }
        return column.get('ordinalPosition');
    }
});