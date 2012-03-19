describe("chorus.views.WorkspaceSearchResultList", function() {
    beforeEach(function() {
        this.search = fixtures.searchResult({
            thisWorkspace: {
                numFound: 9,
                docs: [
                    fixtures.searchResultWorkfileJson(),
                    fixtures.searchResultDatabaseObjectJson(),
                    fixtures.searchResultChorusViewJson(),
                    fixtures.searchResultWorkspaceJson(),
                    fixtures.searchResultAttachmentJson()
                ]
            }
        });
        this.search.set({ query: "foo", workspaceId: "10001" });
        this.search.workspace().set({ name: "John the workspace" });
        var workspaceItems = this.search.workspaceItems();
        this.view = new chorus.views.WorkspaceSearchResultList({
            collection: workspaceItems,
            search: this.search
        });
        this.view.render();
    });

    it("renders the right type of search result view for each result item", function() {
        var listItems = this.view.$("li");
        expect(listItems.eq(0)).toHaveClass("search_workfile");
        expect(listItems.eq(1)).toHaveClass("search_dataset");
        expect(listItems.eq(2)).toHaveClass("search_dataset");
        expect(listItems.eq(3)).toHaveClass("search_workspace");
        expect(listItems.eq(4)).toHaveClass("search_attachment");
    });

    it("has the right title", function() {
        expect(this.view.$(".title").text()).toMatchTranslation("search.type.this_workspace", { name: "John the workspace" });
    });

    describe("#clicking 'show all'", function() {
        beforeEach(function() {
            spyOn(chorus.router, 'navigate');
            this.view.$("a.show_all").click();
        });

        it("navigates to the 'this workspace' search page", function() {
            expect(this.view.search.searchIn()).toBe("this_workspace");
            expect(chorus.router.navigate).toHaveBeenCalledWith(this.view.search.showUrl(), true);
        });
    });
});

