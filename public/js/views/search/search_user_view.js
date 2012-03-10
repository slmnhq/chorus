chorus.views.SearchUser = chorus.views.SearchItemBase.extend({
    constructorName: "SearchUserView",
    className: "search_user",

    additionalContext: function () {
        var modelWithSearchResults = chorus.helpers.withSearchResults(this.model);
        var supportingMessage = _.compact(_.map(
            ["title", "ou", "content", "emailAddress", "name"],
            function(fieldName) {
                var value = modelWithSearchResults.get(fieldName).toString();
                if (value) {
                    var result = {};
                    result[fieldName] = value;
                    return result
                }
            }
        ));

        return {
            iconSrc: this.model.imageUrl({size:"icon"}),
            link: this.model.showUrl(),
            displayName: modelWithSearchResults.displayName(),
            supportingMessage: supportingMessage.slice(0,3),
            moreSupportingMessage: supportingMessage.slice(3),
            hasMoreSupportingMessage: Math.max(0, supportingMessage.length - 3)
        };
    }
})