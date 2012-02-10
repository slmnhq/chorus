chorus.models.SqlExecutionTask = chorus.models.Task.extend({
    taskType: "workfileSQLExecution",

    getRows : function() {
        return this.get("result").rows;
    },

    getColumns : function() {
        return this.get("result").columns;
    }
});
