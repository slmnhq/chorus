chorus.views.SearchUserList = chorus.views.SearchResultListBase.extend({
    className: "search_user_list",
    additionalClass: "list",
    constructorName: "SearchUserListView",

    additionalContext: function() {
        return {
            shown: this.collection.models.length,
            total: this.collection.attributes.total,
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
