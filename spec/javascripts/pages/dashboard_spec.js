describe("chorus.views.Dashboard", function() {
    beforeEach(function() {
        this.loadTemplate("dashboard");
        this.loadTemplate("header");
        this.loadTemplate("breadcrumbs");
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
    })
});
