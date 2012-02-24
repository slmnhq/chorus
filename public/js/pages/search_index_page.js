chorus.pages.SearchIndexPage = chorus.pages.Base.extend({
    crumbs: [
        { label: t("breadcrumbs.home"), url: "#/" },
        { label: t("breadcrumbs.search_results") }
    ],

    setup: function(query) {
        query = decodeURIComponent(query);
        this.model = new chorus.models.SearchResult({query: query});
        this.requiredResources.add(this.model);
        this.model.fetch();
    },

    resourcesLoaded: function() {
        this.mainContent = new chorus.views.MainContentView({
            contentHeader: new chorus.views.StaticTemplate("default_content_header", {
                title: t("search.index.title", {
                    query: this.model.displayShortName()
                })
            }),

            content: new chorus.views.SearchResultList({searchResult: this.model})
        });

        this.render()
    }
});
