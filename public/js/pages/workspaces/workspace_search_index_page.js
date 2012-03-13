chorus.pages.WorkspaceSearchIndexPage = chorus.pages.SearchIndexPage.extend({
    parseSearchParams: function(searchParams) {
        var workspaceId = searchParams.shift();
        var result = this._super("parseSearchParams", [ searchParams ]);
        return _.extend(result, { workspaceId: workspaceId });
    },

    crumbs: function() {
        return [
            { label: t("breadcrumbs.home"), url: "#/" },
            { label: this.search.workspace().get("name"), url: this.search.workspace().showUrl() },
            { label: t("breadcrumbs.search_results") }
        ]
    },

    setup: function() {
        this._super("setup", arguments);
        this.workspaceId = this.search.get("workspaceId");
        this.requiredResources.add(this.search.workspace());
        this.search.workspace().fetch();
    }
})
