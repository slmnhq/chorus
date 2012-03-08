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

    it("sets the workspace id, for prioritizing search", function() {
        expect(this.page.workspaceId).toBe('101');
    });
});
