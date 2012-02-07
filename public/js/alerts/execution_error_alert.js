chorus.alerts.ExecutionError = chorus.alerts.Base.extend({
    title:t("workfile.execution.alert.title"),
    text:t("workfile.execution.alert.text"),
    cancel:t("actions.close_window"),
    additionalClass:"error",

    makeModel:function () {
        this._super("makeModel", arguments);
        this.model = this.model || this.pageModel;
        this.body = this.model.errorMessage();
    },

    postRender:function () {
        this.$(".errors").addClass('hidden');
        this.$("button.submit").addClass("hidden");
    }
});