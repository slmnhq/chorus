chorus.views.SearchInstance = chorus.views.SearchItemBase.extend({
    constructorName: "SearchInstanceView",
    templateName: "search_instance",
    eventType: "instance",

    additionalContext: function () {
        return {
            stateUrl: this.model.stateIconUrl(),
            stateText: _.str.capitalize(this.model.get("state") || "unknown"),
            showUrl: this.model.showUrl(),
            humanSize: I18n.toHumanSize(this.model.get("size")),
            iconUrl: this.model.providerIconUrl()
        }
    }
})
