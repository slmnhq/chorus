chorus.views.SearchUserList = chorus.views.Base.extend({
    className: "search_user_list",
    additionalClass: "list",
    constructorName: "SearchUserListView",

    additionalContext: function() {
        return {
            shown: this.collection.models.length,
            total: this.options.total,
            moreResults: (this.collection.models.length < this.options.total)
        }
    },

    collectionModelContext: function(model) {
        return {
            iconSrc: model.imageUrl({size:"icon"}),
            link: model.showUrl(),
            displayName: model.displayName()
        };
    }
});