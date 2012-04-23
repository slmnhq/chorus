describe("chorus.pages.WorkspaceQuickstartPage", function() {
    beforeEach(function() {
        this.page = new chorus.pages.WorkspaceQuickstartPage(1);
        this.page.render();
    });

    it("renders the quickstart view", function() {
        expect(this.page.mainContent.content).toBeA(chorus.views.WorkspaceQuickstart);
    });

    it("has a workspace quickstart header", function() {
        expect(this.page.mainContent.contentHeader).toBeA(chorus.views.WorkspaceQuickstartHeader);
    });
});