describe("chorus.pages.DashboardPage", function() {
    beforeEach(function() {
        chorus.session = new chorus.models.Session({ id : "foo" })
        this.page = new chorus.pages.DashboardPage();
    });

    describe("#setup", function() {
        it("sets chorus.session.user as the model", function() {
            expect(this.page.model).toBe(chorus.session.user())
        })
    })

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

        it("does not have a sidebar", function() {
            expect(this.page.$("#sidebar_wrapper")).not.toExist();
        });
    });

    context("#setup", function(){
        it("passes the collection with through to the workspaceSet view view", function(){
            expect(this.page.mainContent.workspaceList.collection).toBe(this.page.workspaceSet);
        })

        it("fetches active workspaces for the current user, including recent comments", function() {
            expect(this.page.workspaceSet.attributes.showLatestComments).toBeTruthy();
        })

        it("should sort the workspaceSet by name Descending", function(){
            expect(this.page.workspaceSet.sortIndex).toBe("name");
            expect(this.page.workspaceSet.sortOrder).toBe("asc");
        })

        xit("fetches the right url when the sesison changes", function(){
//            partyConsole.log("there is a problem in testing the seams in login/fetch to triggering save")
            chorus.session.set({id: 14})
            chorus.session.trigger("saved")
            //last request url should have user=14 in it
        })
    })
});
