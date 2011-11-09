describe("chorus.pages.UserNewPage", function() {
    beforeEach(function() {
        this.loadTemplate("user_new");
        this.loadTemplate("breadcrumbs");
        this.loadTemplate("header");
    });

    describe(".initialize", function() {
        context("as an admin", function() {
            beforeEach(function() {
                setLoggedInUser({'admin': true});
                this.page = new chorus.pages.UserNewPage();
                this.page.render();
            });

            it("renders the new user form", function() {
                expect(this.page.$("#new_user_form")).toExist();
            });
        });

        context("as a non admin", function() {
            beforeEach(function() {
                setLoggedInUser({'admin': false});
                this.page = new chorus.pages.UserNewPage();
                this.page.render();
            });


            it("renders the admin-only warning", function() {
                expect(this.page.$(".aint_admin")).toExist();
            });
        });
    })
})