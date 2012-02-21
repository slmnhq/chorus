chorus.models.ChorusView = chorus.models.Dataset.extend({
    initialize: function() {
        this._super('initialize');
        this.joins = []
        this.columns = []
    },

    declareValidations: function(newAttrs) {
        this.require('objectName', newAttrs, "dataset.chorusview.validation.object_name_required");
        this.requirePattern("objectName", /^[a-zA-Z][a-zA-Z0-9_]*/, newAttrs, "dataset.chorusview.validation.object_name_pattern");
    },

    addJoin: function(sourceColumn, destinationColumn, joinType) {
        this.joins.push({ sourceColumn: sourceColumn, destinationColumn: destinationColumn, joinType: joinType })
        destinationColumn.tabularData.datasetNumber = this.joins.length + 1;
        this.trigger("change")
    },

    addColumn: function(column) {
        if (!_.contains(this.columns, column)) {
            this.columns.push(column)
            this.trigger("change")
        }
    },

    removeColumn: function(column) {
        if(_.contains(this.columns, column)) {
            this.columns = _.without(this.columns, column)
            this.trigger("change")
        }
    }
});
