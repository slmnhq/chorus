chorus.alerts.ExecutionMessage = chorus.alerts.Base.extend({
    constructorName: "ExecutionMessage",

    title: t("workfile.execution.message.title"),
    cancel:t("actions.close_window"),
    additionalClass: "info",

    preRender: function() {
        this._super("preRender", arguments);
        var warnings = this.model.get("warnings");
        if(warnings && warnings.length) {
            this.body = warnings.join(" ");
        } else {
            this.body = t('sql_execution.success');
        }
    },

    postRender: function() {
        this.$("button.submit").addClass("hidden");
    }
});
