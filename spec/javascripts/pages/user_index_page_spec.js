describe("chorus.pages.UserIndexPage", function() {
    beforeEach(function() {
        this.loadTemplate("header");
        this.loadTemplate("breadcrumbs");
        this.loadTemplate("user_set");

        chorus.user = new chorus.models.User({
            "firstName" : "Daniel",
            "lastName" : "Burkes",
            "fullName": "Daniel Francis Burkes"
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view = new chorus.pages.UserIndexPage();
            this.view.render();
        })

        it("creates a UserSet view", function() {
           expect(this.view.$(".user_set")).toExist();
        });

        describe("when the authenticated user is an admin", function() {
            beforeEach(function() {
                chorus.user.set({ admin: true });
                this.view.render();
            })

            it("displays an 'add user' button", function() {
                expect(this.view.$("button.add_user")).toExist();
            })
        });

        describe("when the authenticated user is an admin", function() {
            beforeEach(function() {
                chorus.user.set({ admin: false });
                this.view.render();
            })

            it("does not display an 'add user' button", function() {
                expect(this.view.$("button.add_user")).not.toExist();
            })
        });
    })
});
