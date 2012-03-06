describe("chorus.pages.SearchAllIndexPage", function() {
    beforeEach(function() {
        this.query = "I'm a happy camper";
        this.model = new chorus.models.SearchResult({ query: this.query });
        this.page = new chorus.pages.SearchAllIndexPage("workspaces", this.query);
    });

    it("fetches the search results for the given query", function() {
        expect(this.model).toHaveBeenFetched();
    });

    describe("when the fetch completes", function() {
        beforeEach(function() {
            this.model = fixtures.searchResult({ query: "I'm a happy camper" });
            this.server.completeFetchFor(this.model);
        });

        it("displays the breadcrumbs", function() {
            expect(this.page.$(".breadcrumbs li:eq(0)")).toContainTranslation('breadcrumbs.home');
            expect(this.page.$(".breadcrumbs li:eq(0) a").attr("href")).toBe("#/");
            expect(this.page.$(".breadcrumbs li:eq(1) .slug")).toContainTranslation('breadcrumbs.search_results');
        });

        it("has the query as the title", function() {
            expect(this.page.$(".default_content_header h1")).toContainTranslation("search.index.title", {query: this.query});
        });

        it("has a 'Show All Results' link", function() {
            expect(this.page.$('.default_content_header .title')).toContainTranslation("search.show")
            expect(this.page.$('.default_content_header a')).toContainTranslation("search.type.all")
            expect(this.page.$('.default_content_header a')).toContainTranslation("search.type.workfiles")
            expect(this.page.$('.default_content_header a')).toContainTranslation("search.type.hadoop")
            expect(this.page.$('.default_content_header a')).toContainTranslation("search.type.datasets")
            expect(this.page.$('.default_content_header a')).toContainTranslation("search.type.workspaces")
            expect(this.page.$('.default_content_header a')).toContainTranslation("search.type.users")
        });

        it("should have the current type selected in the link menu", function() {
            expect(this.page.$('.default_content_header a .chosen')).toContainTranslation("search.type.workspaces");
        });
    });
});