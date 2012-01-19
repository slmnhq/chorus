(function($, ns) {
    ns.views.ResultsConsole = ns.views.Base.extend({
        className : "results_console",
        events : {
            "click .cancel" : "cancelExecution"
        },

        setup: function() {
            this.bind("file:executionStarted", this.executionStarted, this)
        },

        executionStarted : function() {
            this.$(".right").addClass("executing")
            this.$(".loading").startLoading("results_console_view.executing")
        },

        cancelExecution : function(event) {
            event.preventDefault();
            this.model.save({ action : "cancel" });
        }
    });
})(jQuery, chorus);
