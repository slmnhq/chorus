describe("chorus.views.Dashboard", function(){
    beforeEach(function(){
        this.loadTemplate("dashboard_workspace_list");
        this.loadTemplate("plain_text");
        this.loadTemplate("dashboard_workspace_list_footer");

        this.view = new chorus.views.Dashboard();
        this.view.render();
    });
    
    describe("#render", function() {
        describe("the workspace list", function(){

            it("adds the workspace_list class to the DashboardWorkspaceList view", function() {
                expect(this.view.$(".main_content.workspace_list")).toExist();
            });
            it("displays the workspace list title", function() {
                expect(this.view.$(".main_content.workspace_list .content_header h1").text()).toBe("My Workspaces");
            });
            it("displays the dashboard title", function() {
                expect(this.view.$(".main_content.dashboard_main .content_header h1").text()).toBe("Dashboard");
            });

            it("has a create workspace link", function() {
                expect(this.view.$(".workspace_list .content_footer [data-dialog=WorkspacesNew]")).toExist();
            });
        })
    });
});