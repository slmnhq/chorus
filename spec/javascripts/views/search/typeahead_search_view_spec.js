describe("chorus.views.TypeAheadSearch", function() {
    beforeEach(function() {
        this.result = fixtures.typeAheadSearchResult();
        this.result.set({query: "test"});
        this.view = new chorus.views.TypeAheadSearch();
        this.view.searchFor("test");
    });

    it("should fetch the search result", function() {
        expect(this.result).toHaveBeenFetched();
    });

    describe("when the fetch completes with results", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.result);
        });

        it("should have one entry for each item in the result", function() {
            expect(this.view.$("li.result").length).toBe(this.result.get("typeAhead").docs.length);
        });

        it("should show the link to show all search result", function() {
            expect(this.view.$("li:eq(0)").text()).toMatchTranslation("type_ahead.show_all_results", {query: "test"});
        });
    })

    describe("when the fetch completes and there are no results", function() {
        beforeEach(function() {
            this.result.get("typeAhead").docs = [];
            this.result.get("typeAhead").numFound = 0;

            this.server.completeFetchFor(this.result);
        });

        it("should have no result entries", function() {
            expect(this.view.$("li.result").length).toBe(0);
        });

        it("should show the link to show all search result", function() {
            expect(this.view.$("li:eq(0)").text()).toMatchTranslation("type_ahead.show_all_results", {query: "test"});
        });
    });
})