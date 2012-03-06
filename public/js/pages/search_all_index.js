chorus.pages.SearchAllIndexPage = chorus.pages.Base.extend({
    crumbs: [
        { label: t("breadcrumbs.home"), url: "#/" },
        { label: t("breadcrumbs.search_results") }
    ],

    setup: function(type, query) {
        query = decodeURIComponent(query);
        this.model = new chorus.models.SearchResult({type: type, query: query});
        this.requiredResources.add(this.model);
        this.model.fetch();
    },

    resourcesLoaded: function() {
        this.mainContent = new chorus.views.MainContentView({
            contentHeader: new chorus.views.ListHeaderView({
                title: t("search.index.title", {
                    query: this.model.displayShortName()
                }),
                linkMenus: {
                    type: {
                        title: t("search.show"),
                        options: [
                            {data: "all", text: t("search.type.all")},
                            {data: "workfiles", text: t("search.type.workfiles")},
                            {data: "hadoop", text: t("search.type.hadoop")},
                            {data: "datasets", text: t("search.type.datasets")},
                            {data: "workspaces", text: t("search.type.workspaces")},
                            {data: "users", text: t("search.type.users")}
                        ],
                        chosen: t("search.type." + this.model.get("type")),
                        event: "filter"
                    }
                }
            })
        });
    }
});