chorus.views.SearchWorkspaceList = chorus.views.SearchResultListBase.extend({
    constructorName: "SearchWorkspaceListView",
    className: "search_workspace_list",
    additionalClass: "list",

    additionalContext: function() {
        return {
            shown: this.collection.models.length,
            total: this.options.total,
            hasPrevious: this.query && this.query.hasPreviousPage(),
            hasNext: this.query && this.query.hasNextPage(),
            filteredSearch: this.query && this.query.entityType() == "workspace",
            moreResults: (this.collection.models.length < this.options.total)
        }
    },

    collectionModelContext: function(model){
        return {
            showUrl: model.showUrl(),
            iconUrl: model.customIconUrl()
        }
    }
});