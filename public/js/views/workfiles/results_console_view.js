(function($, ns) {
    ns.views.ResultsConsole = ns.views.Base.extend({
        className : "results_console",
        events : {
            "click .cancel" : "cancelExecution"
        },

        setup: function() {
            this.bind("file:executionStarted", this.executionStarted, this)
            this.bind("file:executionCompleted", this.executionCompleted, this)
        },

        executionStarted : function() {
            this.elapsedTime = 0
            this.$(".right").addClass("executing")
            this.spinnerTimer = _.delay(_.bind(this.startSpinner, this), 250)
            this.elapsedTimer = _.delay(_.bind(this.incrementElapsedTime, this), 1000)
        },

        startSpinner : function() {
            delete this.spinnerTimer;
            this.$(".loading").startLoading("results_console_view.executing")
        },

        incrementElapsedTime : function() {
            this.elapsedTime++
            this.$(".elapsed_time").text(t("results_console_view.elapsed", { sec : this.elapsedTime }))
            this.elapsedTimer = _.delay(_.bind(this.incrementElapsedTime, this), 1000)
        },

        executionCompleted : function(task) {
            this.cancelTimers()
            this.$(".right").removeClass("executing")
            this.$(".loading").stopLoading()
            this.dataTable = new ns.views.TaskDataTable({model: task});
            this.dataTable.render();
            this.$(".result_table").append(this.dataTable.el);
        },

        cancelExecution : function(event) {
            this.cancelTimers()
            event.preventDefault();
            this.model.save({ action : "cancel" });
        },

        cancelTimers : function() {
            if (this.spinnerTimer) {
                clearTimeout(this.spinnerTimer);
                delete this.spinnerTimer
            }

            if (this.elapsedTimer) {
                clearTimeout(this.elapsedTimer);
                delete this.elapsedTimer
            }
        }
    });
})(jQuery, chorus);
