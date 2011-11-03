describe("chorus.views.Header", function() {
    beforeEach(function() {
        this.loadTemplate("header");
        this.view = new chorus.views.Header();
        chorus.user = {
            "firstName" : "Daniel",
            "lastName" : "Burke",
            "fullName": "Daniel Francis Burke"
        };
        this.view.render();
    });

    it("should have a search field", function() {
        this.view.render();
        expect(this.view.$("input[type=text].search")).toExist();
    });

    it("should have a link to the dashboard", function() {
       expect(this.view.$(".logo a").attr("href")).toBe("#/dashboard");
    });

    describe("username", function() {
        describe("less than or equal to 20 characters", function() {
            it("displays the user's full name", function() {
                expect(this.view.$(".username").text()).toBe("Daniel Francis Burke");
            })
        })

        describe("greater than 20 characters", function() {
            beforeEach(function() {
                chorus.user = {
                    "firstName" : "Daniel",
                    "lastName" : "Burkes",
                    "fullName": "Daniel Francis Burkes"
                };
                this.view.render();
            });

            it("displays the user's full name", function() {
                expect(this.view.$(".username").text()).toBe("Daniel B.");
            })
        })
    })
});
