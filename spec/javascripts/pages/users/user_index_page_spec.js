describe("chorus.pages.UserIndexPage", function() {
    beforeEach(function() {
        this.loadTemplate("header");
        this.loadTemplate("breadcrumbs");
        this.loadTemplate("main_content");
        this.loadTemplate("default_content_header");
        this.loadTemplate("count");
        this.loadTemplate("user_list");
        this.loadTemplate("user_index_sidebar");
        this.loadTemplate("logged_in_layout");

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

        it ("has the right header title", function(){
            expect(this.view.$("#content_header").text()).toBe("Users");
        })
         describe("when the collection is loading", function(){
            it("should have a loading element", function(){
                expect(this.view.$(".loading")).toExist();
            });

            it("has a header", function() {
                expect(this.view.$("h1")).toExist();
            })
        });

        it("creates a UserList view", function() {
           expect(this.view.$(".user_list")).toExist();
        });

        describe("when the authenticated user is an admin", function() {
            beforeEach(function() {
                chorus.user.set({ admin: true });
                this.view.render();
            })

            it("displays an 'add user' button", function() {
                expect(this.view.$("a.button.add_user")).toExist();
            })
        });

        describe("when the authenticated user is an admin", function() {
            beforeEach(function() {
                chorus.user.set({ admin: false });
                this.view.render();
            })

            it("does not display an 'add user' button", function() {
                expect(this.view.$("a.button.add_user")).not.toExist();
            })
        });
    })
});
