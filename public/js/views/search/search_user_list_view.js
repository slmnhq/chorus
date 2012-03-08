chorus.views.SearchUserList = chorus.views.SearchResultListBase.extend({
    constructorName: "SearchUserListView",
    className: "search_user_list",
    entityType: "user",

    makeListItemView: function(model) {
        return new chorus.views.SearchUser({ model: model });
    }
});
