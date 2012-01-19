;(function(ns){
    ns.views.TaskDataTable = ns.views.Base.extend({
        className: "data_table",

        additionalContext : function() {
            return { columns: this.model.columnOrientedData() };
        }
    });
})(chorus);
