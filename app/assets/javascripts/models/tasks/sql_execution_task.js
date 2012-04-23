chorus.models.SqlExecutionTask = chorus.models.Task.extend({
    taskType: "workfileSQLExecution",

    getRows : function() {
        return this.has("result") && this.get("result").rows;
    },

    getColumns : function() {
        return this.has("result") && this.get("result").columns;
    }
});
