describe("chorus.pages.WorkspaceIndexPage", function() {
    beforeEach(function() {
        this.loadTemplate("header");
        this.loadTemplate("breadcrumbs");
        this.loadTemplate("main_content");
        this.loadTemplate("default_content_header");
        this.loadTemplate("count");
        this.loadTemplate("workspace_list");
        this.loadTemplate("logged_in_layout");
        this.loadTemplate("dashboard_sidebar");
        this.loadTemplate("workspace_index_content_header");

        chorus.user = new chorus.models.User({
            "firstName" : "Daniel",
            "lastName" : "Burkes",
            "fullName": "Daniel Francis Burkes"
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view = new chorus.pages.WorkspaceIndexPage();
            this.view.render();
        })
         describe("when the collection is loading", function(){
            it("should have a loading element", function(){
                expect(this.view.$(".loading")).toExist();
            });

            it("has a header", function() {
                expect(this.view.$("h1")).toExist();
            })
        });

        it("creates a WorkspaceList view", function() {
           expect(this.view.$(".workspace_list")).toExist();
        });

        it("displays an 'add workspace' button", function() {
            expect(this.view.$("button:contains('Create a Workspace')")).toExist();
        })
    })
});
