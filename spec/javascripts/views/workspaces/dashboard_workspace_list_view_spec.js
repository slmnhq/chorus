describe("chorus.views.DashboardWorkspaceList", function() {
    beforeEach(function(){
        fixtures.model = "Workspace"
        this.workspace = fixtures.modelFor("fetchWithLatestComments")
        this.workspace.get("latestCommentList")[0].timestamp = (50).hours().ago().toString("yyyy-MM-dd hh:mm:ss");
        this.collection = new chorus.models.WorkspaceSet([this.workspace]);
        this.view = new chorus.views.DashboardWorkspaceList({collection : this.collection});
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("displays the name of the workspace", function() {
            expect(this.view.$(".name span").text()).toBe("fortune");
        });

        it("displays the default icon for the workspace", function() {
            expect(this.view.$(".image img").attr("src")).toBe(this.workspace.defaultIconUrl());
        });

        it("links to the workspace page", function() {
            expect(this.view.$(".image").attr("href")).toBe(this.workspace.showUrl());
        });

        context("when a workspace has recent comments", function() {
            it("displays the number of recent comments", function() {
                expect(this.view.$("li:first-child .comment .count").text().trim()).toBe(t("dashboard.workspaces.recent_comments", 1))
            })

            it("displays the relative time of the most recent comment", function() {
                expect(this.view.$("li:first-child .comment .recent .date").text().trim()).toBe("2 days ago")
            })

            it("displays the name of the most recent commenter", function() {
                expect(this.view.$("li:first-child .comment .recent .author").text().trim()).toBe("EDC Admin")
            })
        })
    });
});
