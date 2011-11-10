describe("chorus.pages.DashboardPage", function() {
    beforeEach(function() {
        this.loadTemplate("dashboard");
        this.loadTemplate("header");
        this.loadTemplate("breadcrumbs");
        this.loadTemplate("dashboard_sidebar");
        this.loadTemplate("logged_in_layout");
        this.view = new chorus.pages.DashboardPage();
        chorus.user = new chorus.models.User({
            "firstName" : "Daniel",
            "lastName" : "Burkes",
            "fullName": "Daniel Francis Burkes"
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        })

        it("creates a Header view", function() {
            expect(this.view.$("#header.header")).toExist();
        })
        it("has a create workspace button", function() {
            expect(this.view.$("button:contains('Create a Workspace')")).toExist();
        });
    })
});
