chorus.alerts.Error = chorus.alerts.Base.extend({
    constructorName: "Error",
    cancel:t("actions.close_window"),
    additionalClass:"error",

    makeModel:function () {
        this._super("makeModel", arguments);
        this.body = this.model.errorMessage();
    },

    postRender:function () {
        this._super("postRender")
        this.$(".errors").addClass('hidden');
        this.$("button.submit").addClass("hidden");
    }
});