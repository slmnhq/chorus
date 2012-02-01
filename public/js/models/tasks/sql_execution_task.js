chorus.models.SqlExecutionTask = chorus.models.Task.extend({
    taskType: "workfileSQLExecution",

    columnOrientedData:function () {
        var rows = this.get("result").rows,
            columns = this.get("result").columns;

        return _.map(columns, function (column) {
            var name = column.name;
            return {
                name:name,
                type:column.typeCategory,
                values:_.pluck(rows, name)
            };
        });
    },

    errorMessage:function () {
        return (this.get('result').executeResult !== 'success') && this.get("result").message;
    }
});
