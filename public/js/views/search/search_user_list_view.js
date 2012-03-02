chorus.views.SearchUserList = chorus.views.Base.extend({
    className: "search_user_list",
    additionalClass: "list",
    constructorName: "SearchUserListView",

    events: {
        "click li a.showMoreSupportingMessage": "showMoreMessages",
        "click li .moreSupportingMessage a.hideMoreSupportingMessage": "showLessMessages"
    },

    showMoreMessages: function(evt) {
        evt && evt.preventDefault();
        $(evt.target).closest("li").find(".moreSupportingMessage").removeClass("hidden");
        $(evt.target).addClass("hidden");
    },

    showLessMessages: function(evt) {
        evt && evt.preventDefault();
        $(evt.target).closest("li").find(".moreSupportingMessage").addClass("hidden");
        $(evt.target).closest("li").find("a.showMoreSupportingMessage").removeClass("hidden");
    },


    additionalContext: function() {
        return {
            shown: this.collection.models.length,
            total: this.options.total,
            moreResults: (this.collection.models.length < this.options.total)
        }
    },

    collectionModelContext: function(model) {
        var supportingMessage = _.compact(_.map(
            ["title", "ou", "emailAddress", "name", "content"],
            function(fieldName) {
                var value = model.get(fieldName);
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
            displayName: model.displayName(),
            supportingMessage: supportingMessage.slice(0,3),
            moreSupportingMessage: supportingMessage.slice(3),
            hasMoreSupportingMessage: Math.max(0, supportingMessage.length - 3)
        };
    }
});