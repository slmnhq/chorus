describe("chorus.views.Header", function() {
    beforeEach(function() {
        this.loadTemplate("header");
        chorus.user = new chorus.models.User({
            "firstName" : "Daniel",
            "lastName" : "Burke",
            "fullName": "Daniel Francis Burke"
        });
        this.view = new chorus.views.Header();
        this.view.render();
    });

    it("should have a search field", function() {
        this.view.render();
        expect(this.view.$("input[type=text].search")).toExist();
    });

    it("should have a link to the dashboard", function() {
        expect(this.view.$(".logo a").attr("href")).toBe("#/");
    });

    describe("username", function() {
        describe("where the user has no fullName", function() {
            beforeEach(function() {
                chorus.user.unset("fullName");
            })

            describe("and the synthesized full name is less than 21 characters", function() {
                beforeEach(function() {
                    chorus.user.set({ firstName: "0123456789", lastName: "012345" });
                    this.view.render();
                });

                it("displays the synthesized full name", function() {
                    expect(this.view.$(".username").text()).toBe("0123456789 012345");
                });
            })

            describe("and the synthesized full name is more than 20 characters", function() {
                beforeEach(function() {
                    chorus.user.set({ firstName: "012345678901234", lastName: "0123456789" });
                    this.view.render();
                })

                it("displays the abbreviated synthesized full name", function() {
                    expect(this.view.$(".username").text()).toBe("012345678901234 0.");
                });
             })

        });

        describe("where the user has a fullName", function() {
            describe("less than or equal to 20 characters", function() {
                it("displays the user's full name", function() {
                    expect(this.view.$(".username").text()).toBe("Daniel Francis Burke");
                })
            })

            describe("greater than 20 characters", function() {
                beforeEach(function() {
                    chorus.user.set({
                        "lastName" : "Burkes",
                        "fullName": "Daniel Francis Burkes"
                    });
                    this.view.render();
                });

                it("displays the user's abbreviated full name", function() {
                    expect(this.view.$(".username").text()).toBe("Daniel B.");
                })
            })
        })
    })
});
