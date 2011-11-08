describe("chorus.views.UserIndexPage", function() {
    beforeEach(function() {
        this.loadTemplate("user_index_page");
        this.loadTemplate("header");
        this.loadTemplate("breadcrumbs");
        this.loadTemplate("user_set");
        chorus.user = new chorus.models.User({
            "firstName" : "Daniel",
            "lastName" : "Burkes",
            "fullName": "Daniel Francis Burkes"
        });
    });

    describe("initialize", function() {
        beforeEach(function() {
            spyOn(chorus.user, "bind");
            this.view = new chorus.views.UserIndexPage();
        });

        it("binds to change on chorus.user", function() {
            expect(chorus.user.bind).toHaveBeenCalledWith("change", this.view.render);
        })
    })

    describe("#render", function() {
        beforeEach(function() {
            this.view = new chorus.views.UserIndexPage();
            this.view.render();
        })

        it("creates a Header view", function() {
            expect(this.view.$("#header.header")).toExist();
        });

        it("creates a BreadcrumbsView", function() {
            expect(this.view.$("#breadcrumbs .breadcrumbs")).toExist();
        });

        it("creates a UserSet view", function() {
           expect(this.view.$("#user_list.user_set")).toExist();
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
