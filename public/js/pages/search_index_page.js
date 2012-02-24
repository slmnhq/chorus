chorus.pages.SearchIndexPage = chorus.pages.Base.extend({
    crumbs: [
        { label: t("breadcrumbs.home"), url: "#/" },
        { label: t("breadcrumbs.search_results") }
    ],

    setup: function(query) {
        query = decodeURIComponent(query);
        this.model = this.search = new chorus.models.SearchResult({query: query});
        this.search.fetch();
        this.model.onLoaded(this.otherStuff, this);
    },

    otherStuff: function() {
        this.mainContent = new chorus.views.MainContentView({
            contentHeader: new chorus.views.StaticTemplate("default_content_header",
                {
                    title: t("search.index.title",
                        {
                            query: this.model.displayShortName()
                        }
                    )}
            ),

            content: new chorus.views.SearchResultList({searchResult: this.model})
        })

        this.render()
    }
});