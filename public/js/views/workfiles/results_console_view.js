(function($, ns) {
    ns.views.ResultsConsole = ns.views.Base.extend({
        className : "results_console",
        events : {
            "click .cancel" : "cancelExecution"
        },

        setup: function() {
            this.bind("file:executionStarted", this.executionStarted, this)
            this.bind("file:executionCompleted", this.executionCompleted, this);
        },

        executionStarted : function() {
            this.$(".right").addClass("executing")
            this.$(".loading").startLoading("results_console_view.executing")
        },

        executionCompleted : function(task) {
            this.$(".right").removeClass("executing")
            this.$(".loading").stopLoading()

            this.dataTable = new ns.views.TaskDataTable({model: task});
            this.dataTable.render();
            this.$(".result_table").append(this.dataTable.el);
        },

        cancelExecution : function(event) {
            event.preventDefault();
            this.model.save({ action : "cancel" });
        }
    });
})(jQuery, chorus);
