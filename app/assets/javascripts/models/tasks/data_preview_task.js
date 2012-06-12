chorus.models.DataPreviewTask = chorus.models.Task.extend({
    nameAttribute: "objectName",

    urlTemplate: function() {
        if(this.cancelled) {
            return "database_objects/{{databaseObject.id}}/previews/{{checkId}}";
        }
        return  "database_objects/{{databaseObject.id}}/previews";
    },

    getRows: function() {
        var rows = this.get("rows"),
            columns = this.get("columns"),
            column,
            value;
        return _.map(rows, function(row) {
            return _.inject(_.zip(columns, row), function(memo, columnValuePair) {
                column = columnValuePair[0],
                value = columnValuePair[1];
                memo[column.name] = value;
                return memo;
            }, {});
        });
    }
});

