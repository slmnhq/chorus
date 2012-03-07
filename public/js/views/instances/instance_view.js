chorus.views.Instance = chorus.views.Base.extend({
    constructorName: "InstanceView",
    className:"instance",

    additionalContext:function () {
        return {
            stateUrl: this.model.stateIconUrl(),
            stateText: _.str.capitalize(this.model.get("state") || "unknown"),
            providerUrl: this.model.providerIconUrl()
        }
    }
});
