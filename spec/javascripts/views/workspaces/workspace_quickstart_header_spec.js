describe("chorus.views.WorkspaceQuickstartHeader", function() {
    beforeEach(function() {
        this.model = newFixtures.workspace({ name: "Fancy Workspace" });
        this.view = new chorus.views.WorkspaceQuickstartHeader({ model: this.model });
        this.view.render();
    });

    it("has an icon", function() {
        expect(this.view.$("img").attr("src")).toBe("/images/workspaces/workspace_large.png");
    });

    it("has the title", function() {
        expect(this.view.$("h1")).toContainText("Fancy Workspace");
    });
});
