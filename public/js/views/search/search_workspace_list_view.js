chorus.views.SearchWorkspaceList = chorus.views.SearchResultListBase.extend({
    constructorName: "SearchWorkspaceListView",
    className: "search_workspace_list",
    additionalClass: "list",
    entityType: "workspace",

    makeListItemView: function(model) {
        return new chorus.views.SearchWorkspace({ model: model });
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