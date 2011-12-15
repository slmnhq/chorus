describe("chorus.views.Dashboard", function(){
    beforeEach(function(){
        this.loadTemplate("dashboard_workspace_list");
        this.loadTemplate("dashboard");
        this.loadTemplate("main_content");
        this.loadTemplate("default_content_header");
        this.loadTemplate("main_activity_list");
        this.loadTemplate("plain_text");
        this.loadTemplate("dashboard_workspace_list_footer");

        this.view = new chorus.views.Dashboard();
        this.view.render();
    });

    describe("#render", function() {
        describe("the workspace list", function(){
            it("renders the workspace list with the right title", function() {
                expect(this.view.$(".main_content.workspace_list .content_header h1").text()).toMatchTranslation("header.my_workspaces");
            });

            it("displays the dashboard title", function() {
                expect(this.view.$(".main_content.dashboard_main .content_header h1").text()).toMatchTranslation("dashboard.activity");
            });

            it("has a create workspace link", function() {
                expect(this.view.$(".workspace_list .content_footer [data-dialog=WorkspacesNew]")).toExist();
            });
        });

        it("has an activity list", function() {
            expect(this.view.$(".main_activity_list")).toExist();
        });
    });
});