chorus.models.SqlExecutionTask = chorus.models.Task.extend({
    urlTemplateBase: "sql_executions",

    getRows : function() {
        return this.has("result") && this.get("result").rows;
    },

    getColumns : function() {
        return this.has("result") && this.get("result").columns;
    },

    name: function() {
        return t("dataset.sql.filename");
    }
});
