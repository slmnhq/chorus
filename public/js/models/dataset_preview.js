chorus.models.DatasetPreview = chorus.models.Base.extend({
    urlTemplate: function() {
        if (this.get("tableName")) {
            return "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/table/{{tableName}}/sample";
        } else {
            return "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/view/{{viewName}}/sample";
        }
    },

    columnOrientedData:function () {
        var rows = this.get("rows");
        var columns = this.get("columns");

        return _.map(columns, function (column) {
            var name = column.name;
            return {
                name:name,
                type:column.typeCategory,
                values:_.pluck(rows, name)
            };
        });
    }
});