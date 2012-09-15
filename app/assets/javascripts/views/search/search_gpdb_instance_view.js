chorus.views.SearchGpdbInstance = chorus.views.SearchItemBase.extend({
    constructorName: "SearchGpdbInstanceView",
    templateName: "search_gpdb_instance",
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
