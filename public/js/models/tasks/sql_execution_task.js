chorus.models.SqlExecutionTask = chorus.models.Task.extend(_.extend({}, chorus.Mixins.SQLResults, {
    taskType: "workfileSQLExecution",

    getRows : function() {
        return this.get("result").rows;
    },

    getColumns : function() {
        return this.get("result").columns;
    },

    getErrors : function() {
        return this.get("result");
    }
}));
