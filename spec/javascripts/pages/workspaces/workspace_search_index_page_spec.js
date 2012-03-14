describe("chorus.pages.WorkspaceSearchIndexPage", function() {
    beforeEach(function() {
        this.workspaceId = '101';
        this.query = 'foo';
        this.page = new chorus.pages.WorkspaceSearchIndexPage(this.workspaceId, this.query);
    });

    it("fetches the right search result", function() {
        expect(this.page.search.get("query")).toBe("foo");
        expect(this.page.search.get("workspaceId")).toBe("101");
    });

    it("fetches the workspace", function() {
        expect(this.page.search.workspace()).toHaveBeenFetched();
    });

    describe("when the workspace and search are fetched", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.page.search);
            this.server.completeFetchFor(this.page.search.workspace(), { id: "101", name: "Bob the workspace" });
        });

        it("includes the workspace in the breadcrumbs", function() {
            var crumbs = this.page.$("#breadcrumbs li");
            expect(crumbs.length).toBe(3);
            expect(crumbs.eq(0)).toContainTranslation("breadcrumbs.home");
            expect(crumbs.eq(1).text().trim()).toBe("Bob the workspace");
            expect(crumbs.eq(1).find("a")).toHaveHref(this.page.search.workspace().showUrl());
            expect(crumbs.eq(2)).toContainTranslation("breadcrumbs.search_results");
        });

        it("has the 'this workspace' option in the 'Search in' menu", function() {
            var searchInMenu = this.page.$(".default_content_header .search_in");
            var searchInOptions = searchInMenu.find(".menu a");
            expect(searchInMenu.find(".chosen")).toContainTranslation("search.in.all");
            expect(searchInMenu.find(".title")).toContainTranslation("search.search_in")
            expect(searchInOptions.length).toBe(3);
            expect(searchInOptions).toContainTranslation("search.in.all");
            expect(searchInOptions).toContainTranslation("search.in.my_workspaces");
            expect(searchInOptions).toContainTranslation("search.in.this_workspace");
        });
    });

    it("sets the workspace id, for prioritizing search", function() {
        expect(this.page.workspaceId).toBe('101');
    });
});
