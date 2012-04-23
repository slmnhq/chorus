chorus.alerts.ExecutionMessage = chorus.alerts.Base.extend({
    constructorName: "ExecutionMessage",

    title: t("workfile.execution.message.title"),
    cancel:t("actions.close_window"),
    additionalClass: "info",

    makeModel: function() {
        this.body = this.model.get("result").message;
    },

    postRender: function() {
        this.$("button.submit").addClass("hidden");
    }
});
