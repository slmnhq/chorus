describe("chorus.pages.WorkspaceShowPage", function() {
    beforeEach(function() {
        fixtures.model = "Workspace";
        this.loadTemplate("workspace_detail")
    })

    describe("#initialize", function() {
        beforeEach(function() {
            this.page = new chorus.pages.WorkspaceShowPage(4);
        })

        it("sets up the model properly", function() {
            expect(this.page.model.get("id")).toBe(4);
        })

        it("fetches the model", function() {
            expect(this.server.requests[0].url).toBe("/edc/workspace/4");
        })
    });
});