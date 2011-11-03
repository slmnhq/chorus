describe("chorus.views.Dashboard", function() {
    beforeEach(function() {
        this.loadTemplate("dashboard");
        this.loadTemplate("header");
        this.view = new chorus.views.Dashboard();
        chorus.user = {
            "firstName" : "Daniel",
            "lastName" : "Burkes",
            "fullName": "Daniel Francis Burkes"
        };
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
