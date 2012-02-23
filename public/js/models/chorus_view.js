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
        destinationColumn.tabularData.setDatasetNumber(this.joins.length + 1);
        this.trigger("change");
        this.aggregateColumnSet.add(destinationColumn.tabularData.columns().models);
    },

    addColumn: function(column) {
        var columnList = this._columnListForDataset(column.tabularData);

        if (!_.contains(columnList, column)) {
            columnList.push(column)
            column.selected = true;
            column.trigger("change");
            this.trigger("change")
        }
    },

    removeColumn: function(column) {
        var columnList = this._columnListForDataset(column.tabularData);
        if (columnList.indexOf(column) != -1) {
            columnList.splice(columnList.indexOf(column), 1);
            column.selected = false;
            column.trigger("change");
            this.trigger("change")
        }
    },

    removeJoin: function(dataset) {
        this.joins = _.reject(this.joins, function(join) {
            return join.destinationColumn.tabularData == dataset;
        })

        var columnsToRemove = this.aggregateColumnSet.select(function(column) {
            return column.tabularData == dataset;
        })
        this.aggregateColumnSet.remove(columnsToRemove);

        this.trigger("change");
    },

    generateSelectClause: function() {
        var names = _.map(this._allColumns(), function(column) {
            return column.quotedName()
        });

        return "SELECT " + (names.length ? names.join(", ") : "*");
    },

    generateFromClause: function() {
        var result = "FROM " + this.sourceObject.fromClause();
        _.each(this.joins, _.bind(function(join) {
            result += "\n\t" + this.constructor.joinSqlText(join.joinType) + " " + join.destinationColumn.tabularData.fromClause()
                + " ON " + join.sourceColumn.quotedName() + ' = ' + join.destinationColumn.quotedName();
        }, this));
        return result;
    },

    valid: function() {
        return this._allColumns().length > 0;
    },

    getJoinDatasetByCid: function(cid) {
        return _.find(this.joins, function(join) {
            return join.destinationColumn.tabularData.cid == cid
        }).destinationColumn.tabularData;
    },

    _allColumns: function() {
        return this.sourceObjectColumns.concat(_.flatten(_.pluck(this.joins, "columns")));
    },

    _columnListForDataset: function(dataset) {
        if (dataset == this.sourceObject) {
            return this.sourceObjectColumns;
        }
        var join = _.find(this.joins, function(join) {
            return dataset == join.destinationColumn.tabularData;
        })
        if (join) {
            return join.columns;
        }
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
