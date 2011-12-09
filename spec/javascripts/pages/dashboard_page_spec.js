describe("chorus.pages.DashboardPage", function() {
    beforeEach(function() {
        this.loadTemplate("dashboard");
        this.loadTemplate("header");
        this.loadTemplate("breadcrumbs");
        this.loadTemplate("dashboard_sidebar");
        this.loadTemplate("logged_in_layout");
        this.loadTemplate("main_content")
        this.loadTemplate("dashboard_workspace_list")
        this.loadTemplate("default_content_header")
        this.loadTemplate("plain_text")
        this.loadTemplate("dashboard_workspace_list_footer")
        this.page = new chorus.pages.DashboardPage();
    });

    describe("#render", function() {
        beforeEach(function() {
            this.page.render();
        })

        it("creates a Header view", function() {
            expect(this.page.$("#header.header")).toExist();
        })

        context("the workspace list", function(){
            beforeEach(function(){
                this.workspaceList = this.page.mainContent.workspaceList;
            })

            it("has a title", function() {
                expect(this.workspaceList.$("h1").text()).toBe("My Workspaces");
            });

            it("creates a WorkspaceList view", function() {
                expect(this.page.$(".dashboard_workspace_list")).toExist();
            });
        });
    });

    context("#setup", function(){
        it("passes the collection with through to the workspaceSet view view", function(){
            expect(this.page.mainContent.workspaceList.collection).toBe(this.page.workspaceSet);
        })

        it("only fetches active workspaces", function(){
            expect(this.page.workspaceSet.attributes.active).toBeTruthy();
        })

        it("should sort the workspaceSet by name Descending", function(){
            expect(this.page.workspaceSet.sortIndex).toBe("name");
            expect(this.page.workspaceSet.sortOrder).toBe("asc");
        })

        it("fetches workspaces for the logged in user", function(){
            expect(this.page.workspaceSet.attributes.user).toBe(chorus.session.user());
        })

        xit("fetches the right url when the sesison changes", function(){
            console.log("there is a problem in testing the seams in login/fetch to triggering save")
            chorus.session.set({id: 14})
            chorus.session.trigger("saved")
            //last request url should have user=14 in it
        })
    })
});
