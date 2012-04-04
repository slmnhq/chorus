describe("chorus.views.WorkspaceSummaryContentHeader", function() {
    beforeEach(function() {
        stubDefer();
        this.workspace = fixtures.workspace();
        this.workspace.loaded = true;
        this.view = new chorus.views.WorkspaceSummaryContentHeader({model: this.workspace});
    });

    it("fetches the workspace's activity", function() {
        expect(this.workspace.activities()).toHaveBeenFetched();
    })

    describe("#render", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.workspace.activities());
            this.server.completeFetchFor(this.view.activityListHeader.insightCount, { numberOfInsight: 5 });
            this.view.render();
        })

        it("displays the workspace title", function() {
            expect(this.view.$("h1")).toContainText(this.workspace.get("name"));
        });

        it("fills the activityListHeader subview", function() {
            expect(this.view.$(".activity_list_header")).not.toBeEmpty();
        })

        it("has a truncated text view with the workspace's summary", function() {
            expect(this.view.$(this.view.truncatedSummary.el)).toExist();
            expect(this.view.truncatedSummary.el).not.toBeEmpty();
            expect(this.view.truncatedSummary).toBeA(chorus.views.TruncatedText);

            expect(this.view.truncatedSummary.options.model).toBe(this.workspace);
            expect(this.view.truncatedSummary.options.attribute).toBe("summary");
        })

        it("hides the summary if the workspace does not have one", function() {
            this.view.model.unset("summary");
            this.view.render();
            expect(this.view.$(".truncated_summary")).toHaveClass("hidden");
        });

        it("displays the correct title", function() {
            expect(this.view.$("h1")).toContainText(this.workspace.get("name"));
        });
    });
})