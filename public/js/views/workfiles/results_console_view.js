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
            this.$(".right").addClass("executing")
            this.timerId = _.delay(_.bind(function(){
                delete this.timerId;
                this.$(".loading").startLoading("results_console_view.executing")
            }, this), 250)
        },

        executionCompleted : function() {
            if (this.timerId) {
                clearTimeout(this.timerId);
            }
            this.$(".right").removeClass("executing")
            this.$(".loading").stopLoading()
        },

        cancelExecution : function(event) {
            if (this.timerId) {
                clearTimeout(this.timerId);
            }
            event.preventDefault();
            this.model.save({ action : "cancel" });
        }
    });
})(jQuery, chorus);
