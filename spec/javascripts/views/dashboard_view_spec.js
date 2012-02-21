describe("chorus.views.Dashboard", function(){
    beforeEach(function(){
        var workspaceSet = new chorus.collections.WorkspaceSet();
        var instanceSet = new chorus.collections.InstanceSet();
        this.view = new chorus.views.Dashboard({ collection: workspaceSet, instanceSet: instanceSet });
    });

    describe("#setup", function() {
        it("creates a 'home' activity list", function() {
            expect(this.view.activityList.collection.attributes.entityType).toBe("home")
        });
    })

    describe("#render", function() {
        beforeEach(function () {
            this.view.render();
        });

        describe("the header", function() {
            describe("when the insight count fetch completes", function() {
                beforeEach(function() {
                    var insightCount = chorus.models.CommentInsight.count();
                    this.server.completeFetchFor(insightCount);
                });

                context("when the 'All Activity' button is clicked ", function() {
                    beforeEach(function() {
                        this.activities = chorus.session.user().activities("home");
                        this.view.$(".menus .all").click();
                    });

                    it("should fetch the activity stream (not just the insights)", function() {
                        this.activities.attributes.insights = false;
                        expect(this.activities).toHaveBeenFetched();
                    });

                    describe("when the fetch completes", function() {
                        beforeEach(function() {
                            expect(this.view.$("li.activity").length).toBe(0);

                            this.server.completeFetchFor(this.activities, [
                                fixtures.activities.NOTE_ON_WORKSPACE(),
                                fixtures.activities.NOTE_ON_WORKSPACE(),
                                fixtures.activities.NOTE_ON_WORKSPACE()
                            ]);
                        });

                        it("re-renders the list", function() {
                            expect(this.view.$("li.activity").length).toBe(3);
                        });
                    });
                });

                context("when the 'Insights' button is clicked", function() {
                    beforeEach(function() {
                        this.insights = new chorus.collections.ActivitySet([], { insights: true });
                        this.view.$(".menus .insights").click();
                    });

                    it("should fetch the list of insights", function() {
                        expect(this.insights).toHaveBeenFetched();
                    });

                    describe("when the fetch completes", function() {
                        beforeEach(function() {
                            expect(this.view.$("li.activity").length).toBe(0);

                            this.server.completeFetchFor(this.insights, [
                                fixtures.activities.INSIGHT_CREATED(),
                                fixtures.activities.INSIGHT_CREATED(),
                                fixtures.activities.INSIGHT_CREATED(),
                                fixtures.activities.INSIGHT_CREATED()
                            ]);
                        });

                        it("re-renders the list", function() {
                            expect(this.view.$("li.activity").length).toBe(4);
                        });
                    });
                });
            });
        });

        describe("the workspace list", function(){
            it("renders the workspace list with the right title", function() {
                expect(this.view.$(".main_content.workspace_list .content_header h1").text()).toMatchTranslation("header.my_workspaces");
            });

            it("has a create workspace link in the content details", function() {
                expect(this.view.$(".workspace_list .content_details [data-dialog=WorkspacesNew]")).toExist();
            });

            it("has a 'browse all' link in the content details", function() {
                var browseAllLink = this.view.$(".main_content.workspace_list .content_details a[href='#/workspaces']");
                expect(browseAllLink).toExist();
                expect(browseAllLink.text()).toMatchTranslation("dashboard.workspaces.browse_all");
            });
        });

        describe("the instance list", function() {
            it("renders the instance list with the right title", function() {
                expect(this.view.$(".main_content.instance_list .content_header h1").text()).toMatchTranslation("header.browse_data");
            });

            it("has a 'browse all' link in the content details", function() {
                var browse_link = this.view.$(".dashboard_instance_list_content_details a")
                expect(browse_link.text().trim()).toMatchTranslation("dashboard.instances.browse_all");
                expect(browse_link.attr("href")).toBe("#/instances");
            });
        });

        it("has an activity list", function() {
            expect(this.view.$(".activity_list")).toExist();
        });
    });
});
