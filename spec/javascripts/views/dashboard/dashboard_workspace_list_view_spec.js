describe("chorus.views.DashboardWorkspaceList", function() {
    beforeEach(function(){
        fixtures.model = "Workspace"
        this.workspace1 = fixtures.workspace({ name: "Broccoli", latestCommentList: [] });
        this.workspace2 = fixtures.workspace({ name: "Camels", latestCommentList: [] });
        this.collection = new chorus.collections.WorkspaceSet([this.workspace1, this.workspace2]);
        this.collection.loaded = true;
        this.view = new chorus.views.DashboardWorkspaceList({collection : this.collection});
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("displays the name of the workspace", function() {
            expect(this.view.$(".name span").eq(0).text()).toBe("Broccoli");
            expect(this.view.$(".name span").eq(1).text()).toBe("Camels");
        });

        it("displays the default icon for the workspace", function() {
            expect(this.view.$(".image img").attr("src")).toBe(this.workspace1.defaultIconUrl());
        });

        it("links to the workspace page", function() {
            expect(this.view.$(".image").attr("href")).toBe(this.workspace1.showUrl());
        });

        context("when a workspace has recent comments", function() {
            beforeEach(function() {
                this.comment = fixtures.comment({
                    timestamp: (50).hours().ago().toString("yyyy-MM-dd hh:mm:ss"),
                    text: "I prefer my lemonade with whiskey",
                    author: {
                        firstName: "Boa",
                        lastName: "Constrictor"
                    }
                });
                this.workspace1.comments().add(this.comment);
                this.view.render();
            });

            it("displays the number of recent comments", function() {
                expect(this.view.$("li:first-child .comment .count").text().trim()).toBe(t("dashboard.workspaces.recent_comments", {count: 1}))
            })

            it("displays the relative time of the most recent comment", function() {
                expect(this.view.$("li:first-child .comment .recent .date").text().trim()).toBe("2 days ago")
            })

            it("displays the name of the most recent commenter", function() {
                expect(this.view.$("li:first-child .comment .recent .author").text().trim()).toBe("Boa Constrictor")
            });

            describe("the comments tooltip", function() {
                beforeEach(function() {
                    spyOn($.fn, 'qtip');
                    this.view.render();
                    this.qtipCall = $.fn.qtip.calls[0];
                });

                it("makes a tooltip for each workspace", function() {
                    expect($.fn.qtip).toHaveBeenCalled();
                    expect(this.qtipCall.object).toBe(".comment .count");
                });

                it("renders a CommentList view for each workspace", function() {
                    expect(this.qtipCall.args[0].content).toContain("I prefer my lemonade with whiskey");
                });
            });
        })
    });
});
