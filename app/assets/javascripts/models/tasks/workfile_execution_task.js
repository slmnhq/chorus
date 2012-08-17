chorus.models.WorkfileExecutionTask = chorus.models.Task.extend({
    urlTemplateBase: "workfiles/{{workfile.id}}/executions",
    constructorName: "",
    paramsToSave: ['checkId', 'schemaId', 'sql'],

    name: function() {
        return this.get("workfile").get("fileName");
    },

    executionSchema: function() {
        if(!this._executionSchema) {
            this._executionSchema = new chorus.models.Schema(this.get("executionSchema"));
        }
        return this._executionSchema
    },

    clear: function() {
        delete this._executionSchema;
        this._super('clear', arguments);
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
