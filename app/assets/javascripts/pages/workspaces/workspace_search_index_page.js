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

    searchInMenuOptions: function() {
        return this._super("searchInMenuOptions", arguments).concat([
            { data: "this_workspace", text: t("search.in.this_workspace", {workspaceName: this.search.workspace().get("name")}) }
        ]);
    },

    typeOptions: function() {
        var options = this._super("typeOptions", arguments);
        if (this.search.isScoped()) {
            var toDisable = ["instance", "user", "workspace", "hdfs"];
            _.each(options, function(option) {
                if (_.include(toDisable, option.data)) {
                    option.disabled = true;
                }
            });
        }

        return options;
    },

    setup: function() {
        this._super("setup", arguments);
        this.workspaceId = this.search.get("workspaceId");
        this.requiredResources.add(this.search.workspace());
        this.search.workspace().fetch();
    }
})
