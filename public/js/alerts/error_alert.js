chorus.alerts.Error = chorus.alerts.Base.extend({
    constructorName: "Error",
    cancel:t("actions.close_window"),
    additionalClass:"error",

    makeModel:function () {
        this._super("makeModel", arguments);
        this.options = this.options || {};
        this.options.launchElement = this.options.launchElement || $("<a/>");
        this.body = this.options.launchElement.data("body") || this.model.errorMessage();
        this.title = this.options.launchElement.data("title") || this.title;
    },

    postRender:function () {
        this._super("postRender")
        this.$(".errors").addClass('hidden');
        this.$("button.submit").addClass("hidden");
    }
});