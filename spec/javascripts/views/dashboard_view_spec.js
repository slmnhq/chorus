describe("chorus.views.Dashboard", function(){
    beforeEach(function(){
        var workspaceSet = new chorus.collections.WorkspaceSet();
        var instanceSet = new chorus.collections.InstanceSet();
        this.view = new chorus.views.Dashboard({ collection: workspaceSet, instanceSet: instanceSet });
    });

    describe("#setup", function() {
        beforeEach(function() {
            this.insights = new chorus.models.CommentInsight({action: "count"});
        });

        it("creates a 'home' activity list", function() {
            expect(this.view.activityList.collection.attributes.entityType).toBe("home")
        });

        it("fetches the number of insights", function() {
            expect(this.server.lastFetchFor(this.insights)).toBeDefined();
        });

        context("when the fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.insights);
            });

            xit("should display the number of insights", function() {
                expect(this.view.$(".menus .count").text()).toBe(this.insights.get("count"));
            });

            describe("clicking on 'Insights'", function() {
                beforeEach(function() {
                    this.view.$(".menus .insights").click();
                });

                xit("should only display insights in the activity stream", function() {
                    expect(this.server.lastFetch().url).toBe("/edc/commentinsight");
                });
            });

            describe("clicking on 'All Activity'", function() {
                beforeEach(function() {
                    this.view.$(".menus .all").click();
                });

                it("should display all activity in the activity stream", function() {

                });
            });
        });
    })

    describe("#render", function() {
        beforeEach(function () {
            this.view.render();
        });

        describe("the header", function() {
            it("should have a filter menu", function() {
                expect(this.view.$(".menus .title")).toContainTranslation("filter.show");
                expect(this.view.$(".menus .all")).toContainTranslation("filter.all_activity");
                expect(this.view.$(".menus .insights")).toContainTranslation("filter.only_insights");
            });
        });

        describe("the workspace list", function(){
            it("renders the workspace list with the right title", function() {
                expect(this.view.$(".main_content.workspace_list .content_header h1").text()).toMatchTranslation("header.my_workspaces");
            });

            it("displays the dashboard title", function() {
                expect(this.view.$(".main_content.dashboard_main .content_header h1").text()).toMatchTranslation("dashboard.activity");
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
