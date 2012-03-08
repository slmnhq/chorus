chorus.pages.WorkspaceSearchIndexPage = chorus.pages.SearchIndexPage.extend({
    parseSearchParams: function(searchParams) {
        var workspaceId = searchParams.shift();
        var result = this._super("parseSearchParams", [ searchParams ]);
        return _.extend(result, { workspaceId: workspaceId });
    },

    setup: function() {
        this._super("setup", arguments);
        this.workspaceId = this.search.get("workspaceId");
    }
})
