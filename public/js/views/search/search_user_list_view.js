chorus.views.SearchUserList = chorus.views.SearchResultListBase.extend({
    constructorName: "SearchUserListView",
    className: "search_user_list",
    additionalClass: "list",
    constructorName: "SearchUserListView",
    entityType: "user",    

    makeListItemView: function(model) {
        return new chorus.views.SearchUser({ model: model });
    },

    postRender: function() {
        var ul = this.$("ul");
        this.collection.each(function(model) {
            try {
                ul.append(this.makeListItemView(model).render().el);
            } catch (err) {
                chorus.log(err);
            }
        }, this);
    }
});
