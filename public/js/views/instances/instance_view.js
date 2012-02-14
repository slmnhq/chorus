chorus.views.Instance = chorus.views.Base.extend({
    className:"instance",

    additionalContext:function () {
        return {
            stateUrl: this.model.stateIconUrl(),
            providerUrl: this.model.providerIconUrl()
        }
    }
});
