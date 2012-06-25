chorus.collections.DatabaseColumnSet = chorus.collections.Base.extend({
    model: chorus.models.DatabaseColumn,

    modelAdded: function(model) {
        if (this.dataset) model.dataset = this.dataset;
    },

    urlTemplate: function() {
        return "datasets/{{id}}/columns"
    },

    urlParams: function() {
        return {
            type: this.attributes.type
        };
    },

    comparator: function(column) {
        if (column.dataset && column.dataset.datasetNumber) {
            return (column.dataset.datasetNumber * 10000) + column.get('ordinalPosition');
        }
        return column.get('ordinalPosition');
    }
});
