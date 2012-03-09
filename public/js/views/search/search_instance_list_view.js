chorus.views.SearchInstanceList = chorus.views.SearchResultListBase.extend({
    constructorName: "SearchInstanceList",
    className: "search_instance_list",
    additionalClass: "list",

    additionalContext: function() {
        return {
            shown: this.collection.models.length,
            filteredSearch: this.query && this.query.entityType() == "instance",
            hasPrevious: this.query && this.query.hasPreviousPage(),
            hasNext: this.query && this.query.hasNextPage(),
            total: this.options.total,
            moreResults: (this.collection.models.length < this.options.total)
        }
    },

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