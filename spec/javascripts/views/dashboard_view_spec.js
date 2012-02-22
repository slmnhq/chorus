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
            beforeEach(function() {
                this.headerView = this.view.dashboardMain.contentHeader;
            });

            it("is an ActivityListHeader view", function() {
                expect(this.headerView).toBeA(chorus.views.ActivityListHeader);
            });

            it("has the current user's activity set", function() {
                expect(this.headerView.collection).toBeA(chorus.collections.ActivitySet);
                expect(this.headerView.collection.attributes.entityType).toBe("home");
                expect(this.headerView.collection.attributes.entityId).toBe(chorus.session.user().get("id"));
            });

            it("has the right title", function() {
                expect(this.headerView.options.title).toMatchTranslation("dashboard.title.activity");
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
