chorus.views.SearchInstanceList = chorus.views.SearchResultListBase.extend({
    constructorName: "SearchInstanceList",
    className: "search_instance_list",
    additionalClass: "list",
    entityType: "instance",

    collectionModelContext: function(model) {
        return {
            stateUrl: model.stateIconUrl(),
            stateText: _.str.capitalize(model.get("state") || "unknown"),
            showUrl: model.showUrl(),
            humanSize: I18n.toHumanSize(model.get("size")),
            iconUrl: model.providerIconUrl()
        }
    }
});