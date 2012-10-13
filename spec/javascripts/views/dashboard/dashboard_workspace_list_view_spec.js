describe("chorus.views.DashboardWorkspaceList", function() {
    beforeEach(function() {
        this.workspace1 = rspecFixtures.workspace({ name: "Broccoli", latestCommentList: [] });
        this.workspace2 = rspecFixtures.workspace({ name: "Camels", latestCommentList: [] });
        this.collection = new chorus.collections.WorkspaceSet([this.workspace1, this.workspace2]);
        this.collection.loaded = true;
        this.view = new chorus.views.DashboardWorkspaceList({collection: this.collection});
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
                var workspace = rspecFixtures.workspace();
                this.workspace1.comments().reset(workspace.comments().models);
                this.workspace1.comments().each(function(comment, index) {
                    var timestamp = (50 - index).hours().ago().toString("yyyy-MM-ddThh:mm:ssZ");
                    comment.set({timestamp: timestamp});
                });
                this.view.render();
            });

            context("when there are no insights", function() {
                beforeEach(function() {
                    this.workspace1.set({numberOfComments: 4, numberOfInsights: 0});
                    this.view.render();
                });

                it("displays only the number of recent comments", function() {
                    expect(this.view.$("li:first-child .comment .count").text().trim()).toContainTranslation(
                        "dashboard.workspaces.recent_comments", {count: 4})
                });

                it("doesn't display the badge", function() {
                    expect(this.view.$("li:first-child .badge")).not.toExist();
                });
            });

            context("when there are no comments", function() {
                beforeEach(function() {
                    this.workspace1.set({numberOfComments: 0, numberOfInsights: 4});
                    this.view.render();
                });

                it("displays only the number of recent insights", function() {
                    expect(this.view.$("li:first-child .comment .count").text().trim()).toContainTranslation(
                        "dashboard.workspaces.recent_insights", {count: 4})
                });

                it("displays the badge", function() {
                    expect(this.view.$("li:first-child .badge")).toExist();
                });
            });

            context("when both insights and comments are available", function() {
                beforeEach(function() {
                    this.workspace1.set({numberOfComments: 3, numberOfInsights: 4});
                    this.view.render();
                });

                it("displays both the number of recent insights and comments", function() {
                    expect(this.view.$("li:first-child .comment .count").text().trim()).toContainTranslation(
                        "dashboard.workspaces.recent_comments_and_insights", {
                            recent_comments: t("dashboard.workspaces.recent_comments", {count: 3}),
                            recent_insights: t("dashboard.workspaces.recent_insights", {count: 4})
                        })
                });

                it("displays the badge", function() {
                    expect(this.view.$("li:first-child .badge")).toExist();
                });
            });

            context("when there are no insights or comments", function() {
                it("displays no insights or comments when 0", function() {
                    this.workspace1.set({numberOfComments: 0, numberOfInsights: 0});
                    this.view.render();
                    expect(this.view.$("li:first-child .comment .count").text().trim()).toContainTranslation(
                        "dashboard.workspaces.no_recent_comments_or_insights")
                });

                it("displays no insights or comments when null", function() {
                    this.workspace1.set({numberOfComments: null, numberOfInsights: null});
                    this.view.render();
                    expect(this.view.$("li:first-child .comment .count").text().trim()).toContainTranslation(
                        "dashboard.workspaces.no_recent_comments_or_insights")
                });

                it("doesn't display the badge", function() {
                    expect(this.view.$("li:first-child .badge")).not.toExist();
                });
            });

            it("displays the relative time of the most recent comment", function() {
                expect(this.view.$("li:first-child .comment .recent .date").text().trim()).toBe("2 days ago")
            });

            it("displays the name of the most recent commenter", function() {
                expect(this.view.$("li:first-child .comment .recent .author").text().trim()).toBe(this.workspace1.comments().last().author().name());
            });

            describe("the comments tooltip", function() {
                beforeEach(function() {
                    this.qtipElement = stubQtip();
                    spyOn(chorus.views.ActivityList.prototype, 'initialize').andCallThrough();
                    this.view.render();
                    this.qtipCall = $.fn.qtip.calls[0];
                    this.view.$('.comment .count').mouseover();
                });

                it("makes a tooltip for each workspace", function() {
                    expect($.fn.qtip).toHaveBeenCalled();
                    expect(this.qtipCall.object).toBe(".comment .count");
                });

                it("renders an activity list view for each workspace", function() {
                    var $target = this.qtipCall.args[0].content;
                    expect(chorus.views.ActivityList.prototype.initialize).toHaveBeenCalled();
                    var activityList = chorus.views.ActivityList.prototype.initialize.calls[0].object;
                    expect($target[0]).toBe(activityList.el);
                    expect(activityList.collection).toBe(this.workspace1.comments());
                });

                it("renders the activity lists in read-only mode", function() {
                    expect(this.qtipElement.find("a.publish")).not.toExist();
                    expect(this.qtipElement.find("a.unpublish")).not.toExist();
                });

                it("sorts them with the newest first", function() {
                    var commentsCollection = this.workspace1.comments();
                    var timestamps = [];
                    this.qtipElement.find("li.activity").each(function() {
                        timestamps.push(commentsCollection.get($(this).data('activityId')).get("timestamp"))
                    });
                    expect(timestamps).toEqual(_.clone(timestamps).sort().reverse());
                });
            });
        });
    });

    describe("event handling", function() {
        beforeEach(function() {
            this.view.render();
        });

        describe("insight:promoted", function() {
            beforeEach(function() {
                chorus.PageEvents.broadcast("insight:promoted");
            });

            it("re-fetches the collection", function() {
                expect(this.view.collection.attributes.active).toBe(true);
                expect(this.server.lastFetchFor(this.view.collection)).toBeDefined();
            });
        });
    });
});
