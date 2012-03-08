chorus.views.SearchWorkspaceList = chorus.views.SearchResultListBase.extend({
    constructorName: "SearchWorkspaceListView",
    className: "search_workspace_list",
    entityType: "workspace",

    makeListItemView: function(model) {
        return new chorus.views.SearchWorkspace({ model: model });
    }
});