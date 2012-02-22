chorus.models.ChorusView = chorus.models.Dataset.extend({
    initialize: function() {
        this._super('initialize');
        this.joins = []
        this.sourceObjectColumns = []
    },

    declareValidations: function(newAttrs) {
        this.require('objectName', newAttrs, "dataset.chorusview.validation.object_name_required");
        this.requirePattern("objectName", /^[a-zA-Z][a-zA-Z0-9_]*$/, newAttrs, "dataset.chorusview.validation.object_name_pattern");
    },

    addJoin: function(sourceColumn, destinationColumn, joinType) {
        this.joins.push({ sourceColumn: sourceColumn, destinationColumn: destinationColumn, joinType: joinType, columns: [] })
        destinationColumn.tabularData.datasetNumber = this.joins.length + 1;
        this.trigger("change");
        this.aggregateColumnSet.add(destinationColumn.tabularData.columns().models);
    },

    addColumn: function(column) {
        var columnList;
        if (column.tabularData == this.sourceObject) {
            columnList = this.sourceObjectColumns;
        } else {
            columnList = _.find(this.joins,
                function(join) {
                    return join.destinationColumn.tabularData == column.tabularData;
                }).columns;
        }
        if (!_.contains(columnList, column)) {
            columnList.push(column)
            this.trigger("change")
        }
    },

    removeColumn: function(column) {
        if (_.contains(this.sourceObjectColumns, column)) {
            this.sourceObjectColumns = _.without(this.sourceObjectColumns, column)
            this.trigger("change")
        }
    },

    selectClause: function() {
        var allColumns = this.sourceObjectColumns.concat(_.flatten(_.pluck(this.joins, "columns")));
        var names = _.map(allColumns, function(column) {
            return column.quotedName()
        });

        return "SELECT " + (names.length ? names.join(", ") : "*");
    },

    fromClause: function() {
        var result = "FROM " + this.safePGName(this.sourceObject.get("objectName"));
        _.each(this.joins, _.bind(function(join) {
            result += "\n\t" + this.constructor.joinSqlText(join.joinType) + " " + join.destinationColumn.tabularData.quotedName()
                + " ON " + join.sourceColumn.quotedName() + ' = ' + join.destinationColumn.quotedName();
        }, this));
        return result;
    },

    valid: function() {
        return this.sourceObjectColumns.length > 0 || _.any(this.joins, function(join) {
            return join.columns.length > 0;
        })
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
