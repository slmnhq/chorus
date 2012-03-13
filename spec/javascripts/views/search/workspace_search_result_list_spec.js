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
        this.result.workspace().set({ name: "John the workspace" });
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

    it("has the right title", function() {
        expect(this.view.$(".title").text()).toMatchTranslation("search.type.this_workspace", { name: "John the workspace" });
    });
});

