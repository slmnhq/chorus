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
        this.result.set({ query: "foo" });

        var workspaceItems = this.result.workspaceItems();

        this.view = new chorus.views.WorkspaceSearchResultList({
            collection: workspaceItems,
            query: this.result
        });

        this.view.render();
    });

    it("renders the right type of search result view for each result item", function() {
        var listItems = this.view.$("li");
        expect(listItems.eq(0)).toHaveClass("search_workfile");
        expect(listItems.eq(1)).toHaveClass("search_dataset");
        expect(listItems.eq(2)).toHaveClass("search_dataset");
    });
});

