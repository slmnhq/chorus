;(function(ns){
    ns.models.Task = ns.models.Base.extend({
        urlTemplate: "task/sync/",

        initialize: function(attrs) {
            if (!attrs.taskType) this.set({ taskType: "workfileSQLExecution" });
        },

        columnOrientedData : function() {
            var rows    = this.get("result").rows,
                columns = this.get("result").columns;

            return _.map(columns, function(column) {
                var name = column.name;
                return {
                    name: name,
                    type: column.typeCategory,
                    values: _.pluck(rows, name)
                };
            });
        },

        errorMessage : function() {
            return this.get("result").message;
        }
    });
})(chorus);
