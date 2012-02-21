chorus.models.ChorusView = chorus.models.Dataset.extend({
    initialize: function() {
        this._super('initialize');
        this.joins = []
        this.columns = []
    },

    declareValidations: function(newAttrs) {
        this.require('objectName', newAttrs, "dataset.chorusview.validation.object_name_required");
        this.requirePattern("objectName", /^[a-zA-Z][a-zA-Z0-9_]*$/, newAttrs, "dataset.chorusview.validation.object_name_pattern");
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
        if (_.contains(this.columns, column)) {
            this.columns = _.without(this.columns, column)
            this.trigger("change")
        }
    },

    fromClause: function() {
        var result = "FROM " + this.safePGName(this.sourceObject.get("objectName"));
        _.each(this.joins, _.bind(function(join) {
            result += "\n\t" + this.constructor.joinSqlText(join.joinType) + " " + join.destinationColumn.tabularData.quotedName()
                + " ON " + join.sourceColumn.quotedName() + ' = ' + join.destinationColumn.quotedName();
        }, this));
        return result;
    }
}, {
    joinMap: [
        {value: 'inner', sqlText: "INNER JOIN", text: 'dataset.manage_join_tables.inner'},
        {value: 'left', sqlText: "LEFT JOIN", text: 'dataset.manage_join_tables.left'},
        {value: 'right', sqlText: "RIGHT JOIN", text: 'dataset.manage_join_tables.right'},
        {value: 'outer', sqlText: "FULL OUTER JOIN", text: 'dataset.manage_join_tables.outer'}
    ],

    joinSqlText: function(type) {
        return _.find(this.joinMap,
            function(joinType) {
                return joinType.value == type;
            }).sqlText;
    }
});
