chorus.models.ChorusView = chorus.models.WorkspaceDataset.extend({
    constructorName: "ChorusView",
    paramsToSave: ['id', 'objectName', 'schemaId', 'workspaceId', 'query', 'sourceObjectId', 'sourceObjectType'],

    urlTemplate: function(options) {
        return "chorus_views";
    },

    workspaceId: function() {
        return this.workspace().id;
    },

    initialize: function() {
        this.sourceObjectId = this.get("sourceObjectId");
        this._super('initialize');
        this.joins = [];
        this.sourceObjectColumns = [];
        this.attributes.type = "CHORUS_VIEW";
        this.attributes.objectType = "CHORUS_VIEW";
    },

    declareValidations: function(newAttrs) {
        this.require('objectName', newAttrs, "dataset.chorusview.validation.object_name_required");
        this.requirePattern("objectName", chorus.ValidationRegexes.ChorusIdentifier(), newAttrs, "dataset.chorusview.validation.object_name_pattern");
    },

    addJoin: function(sourceColumn, destinationColumn, joinType) {
        this.joins.push({ sourceColumn: sourceColumn, destinationColumn: destinationColumn, joinType: joinType, columns: [] })
        destinationColumn.dataset.setDatasetNumber(this.joins.length + 1);
        this.trigger("change");
        this.aggregateColumnSet.add(destinationColumn.dataset.columns().models);
        this.aggregateColumnSet.trigger("change");
        this.aggregateColumnSet.trigger("join:added");
    },

    schema: function() { return this.sourceObject.schema(); },
    workspace: function() { return this.sourceObject.workspace(); },

    addColumn: function(column) {
        var columnList = this._columnListForDataset(column.dataset);

        if (!_.contains(columnList, column)) {
            columnList.push(column)
            column.selected = true;
            column.trigger("change");
            this.trigger("change")
        }
    },

    removeColumn: function(column) {
        var columnList = this._columnListForDataset(column.dataset);
        if (columnList.indexOf(column) != -1) {
            columnList.splice(columnList.indexOf(column), 1);
            column.selected = false;
            column.trigger("change");
            this.trigger("change")
        }
    },

    removeJoin: function(dataset) {
        var joinToRemove = _.find(this.joins, function(join) {
            return join.destinationColumn.dataset == dataset;
        })
        this.joins = _.without(this.joins, joinToRemove);

        this.removeDependentJoins(joinToRemove);

        this._reorderJoins();

        var columnsToRemove = this.aggregateColumnSet.select(function(column) {
            return column.dataset == dataset;
        })
        this.aggregateColumnSet.remove(columnsToRemove);

        this.trigger("change");
    },

    removeDependentJoins: function(removedJoin) {
        var dependentJoins = _.filter(this.joins, function(join) {
            return join.sourceColumn.dataset == removedJoin.destinationColumn.dataset;
        });

        _.each(dependentJoins, _.bind(function(join) {
            this.removeJoin(join.destinationColumn.dataset);
        }, this));
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
            result += "\n\t" + this.constructor.joinSqlText(join.joinType) + " " + join.destinationColumn.dataset.fromClause()
                + " ON " + join.sourceColumn.quotedName() + ' = ' + join.destinationColumn.quotedName();
        }, this));
        return result;
    },

    valid: function() {
        return this._allColumns().length > 0;
    },

    getJoinDatasetByCid: function(cid) {
        return _.find(this.joins, function(join) {
            return join.destinationColumn.dataset.cid == cid
        }).destinationColumn.dataset;
    },

    _reorderJoins: function() {
        _.each(this.joins, function(join, index) {
            join.destinationColumn.dataset.setDatasetNumber(index + 2);
        });
    },

    _allColumns: function() {
        return this.sourceObjectColumns.concat(_.flatten(_.pluck(this.joins, "columns")));
    },

    _columnListForDataset: function(dataset) {
        if (dataset == this.sourceObject) {
            return this.sourceObjectColumns;
        }
        var join = _.find(this.joins, function(join) {
            return dataset == join.destinationColumn.dataset;
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
