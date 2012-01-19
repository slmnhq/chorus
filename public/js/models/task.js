;(function(ns){
    ns.models.Task = ns.models.Base.extend({
        urlTemplate: "task/sync/",

        initialize: function(attrs) {
            if (!attrs.taskType) this.set({ taskType: "workfileSQLExecution" });
        }
    });
})(chorus);
