describe("chorus.views.UserListPage", function() {
    beforeEach(function() {
        this.loadTemplate("user_list_page");
        this.loadTemplate("header");
        this.loadTemplate("user_set");
        this.view = new chorus.views.UserListPage();
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
        });

        it("creates a UserSet view", function() {
           expect(this.view.$("#user_list.user_set")).toExist();
        })
    })
});
