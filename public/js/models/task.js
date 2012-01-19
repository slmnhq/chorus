;(function(ns){
    ns.models.Task = ns.models.Base.extend({
        urlTemplate: "task/sync/",

        initialize: function(attrs) {
            if (!attrs.taskType) this.set({ taskType: "workfileSQLExecution" });
        },

        columnOrientedData : function() {
            var rows = this.get("rows");
            return _.map(this.get("columns"), function(column) {
                var name = column.name;
                return {
                    name: name,
                    values: _.pluck(rows, name)
                };
            });
        }
    });
})(chorus);
