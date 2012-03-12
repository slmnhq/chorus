describe("chorus.views.WorkspaceSearchResultList", function() {
    beforeEach(function() {
        this.result = fixtures.searchResult({
            thisWorkspace: {
                numFound: 3,
                docs: [
                    fixtures.searchResultWorkfileJson(),
                    fixtures.searchResultDatabaseObjectJson(),
                    fixtures.searchResultChorusViewJson(),
                ]
            }
        });
        this.result.set({ query: "foo", workspaceId: "10001" });

        var workspaceItems = this.result.workspaceItems();

        this.view = new chorus.views.WorkspaceSearchResultList({
            collection: workspaceItems,
            query: this.result
        });

        this.view.render();
    });

    it("fetches the workspace", function() {
        expect(this.result.workspace()).toHaveBeenFetched();
    });

    describe("when the workspace fetch completes", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.result.workspace(), { name: "Oi Ocha" });
        });

        it("renders the right type of search result view for each result item", function() {
            var listItems = this.view.$("li");
            expect(listItems.eq(0)).toHaveClass("search_workfile");
            expect(listItems.eq(1)).toHaveClass("search_dataset");
            expect(listItems.eq(2)).toHaveClass("search_dataset");
        });

        it("has the right title", function() {
            expect(this.view.$(".title").text()).toMatchTranslation("search.type.this_workspace", { name: "Oi Ocha" });
        });
    });
});

