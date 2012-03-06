chorus.views.Instance = chorus.views.Base.extend({
    className:"instance",

    additionalContext:function () {
        return {
            stateUrl: this.model.stateIconUrl(),
            stateText: _.str.capitalize(this.model.get("state") || "unknown"),
            providerUrl: this.model.providerIconUrl()
        }
    }
});
