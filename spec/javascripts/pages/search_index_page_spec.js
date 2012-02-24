describe("chorus.pages.SearchIndexPage", function() {
    beforeEach(function() {
        this.query = "I'm a happy camper";
        this.page = new chorus.pages.SearchIndexPage(this.query);
        this.model = fixtures.searchResult()
        this.server.lastFetchFor(this.page.model).succeed(this.model);
    });

    describe("#render", function() {
        beforeEach(function() {
            this.page.model.trigger('loaded');
            this.page.render();
        });

        it("has breadcrumbs", function() {
            expect(this.page.$(".breadcrumbs li:eq(0)")).toContainTranslation('breadcrumbs.home');
            expect((this.page.$(".breadcrumbs li:eq(0) a")).attr("href")).toBe("#/");

            expect(this.page.$(".breadcrumbs li:eq(1) .slug")).toContainTranslation('breadcrumbs.search_results');
        });

        it("has the right title", function() {
            expect(this.page.$(".default_content_header h1")).toContainTranslation("search.index.title", {query: this.query});
        });
    });
});