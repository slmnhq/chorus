chorus.views.SearchUserList = chorus.views.SearchResultListBase.extend({
    constructorName: "SearchUserListView",
    className: "search_user_list",
    additionalClass: "list",
    constructorName: "SearchUserListView",

    additionalContext: function() {
        return {
            total: this.options.total,
            shown: this.collection.models.length,
            hasPrevious: this.query && this.query.hasPreviousPage(),
            hasNext: this.query && this.query.hasNextPage(),
            filteredSearch: this.query && this.query.entityType() == "user",
            moreResults: (this.collection.models.length < this.collection.attributes.total)
        }
    },

    collectionModelContext: function(model) {
        var modelWithSearchResults = chorus.helpers.withSearchResults(model);
        var supportingMessage = _.compact(_.map(
            ["title", "ou", "content", "emailAddress", "name"],
            function(fieldName) {
                var value = modelWithSearchResults.get(fieldName);
                if (value) {
                    var result = {};
                    result[fieldName] = value;
                    return result
                };
            }
        ));

        return {
            iconSrc: model.imageUrl({size:"icon"}),
            link: model.showUrl(),
            displayName: modelWithSearchResults.displayName(),
            supportingMessage: supportingMessage.slice(0,3),
            moreSupportingMessage: supportingMessage.slice(3),
            hasMoreSupportingMessage: Math.max(0, supportingMessage.length - 3)
        };
    }
});
