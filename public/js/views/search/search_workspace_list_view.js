chorus.views.SearchWorkspaceList = chorus.views.SearchResultListBase.extend({
    constructorName: "SearchWorkspaceListView",
    className: "search_workspace_list",
    additionalClass: "list",
    entityType: "workspace",

    collectionModelContext: function(model){
        return {
            showUrl: model.showUrl(),
            iconUrl: model.customIconUrl()
        }
    }
});