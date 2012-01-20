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
            _.delay(_.bind(function(){ this.$(".loading").startLoading("results_console_view.executing") }, this), 250)
        },

        cancelExecution : function(event) {
            event.preventDefault();
            this.model.save({ action : "cancel" });
        }
    });
})(jQuery, chorus);
