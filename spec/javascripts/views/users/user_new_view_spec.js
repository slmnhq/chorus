describe("chorus.views.UserNewMain", function() {

    it("is hella happy", function(){
        this.loadTemplate("main_content")
        this.loadTemplate("default_content_header")
        this.loadTemplate("plain_text")

        var view = new chorus.views.UserNewMain()
        view.render()
    })

})
describe("chorus.views.userNew", function() {
    beforeEach(function() {
        this.loadTemplate("user_new");
    })


    describe("#render", function() {
        context("as an admin", function() {
            beforeEach(function() {
                setLoggedInUser({'admin': true});
                this.user = new chorus.models.User()
                this.view = new chorus.views.UserNew({model : this.user});
                this.view.render();
            });

            context("submitting the form", function() {
                beforeEach(function() {
                    this.view.$("input[name=firstName]").val("Frankie")
                    this.view.$("input[name=lastName]").val("Knuckles")
                    this.view.$("input[name=userName]").val("frankie2002")
                    this.view.$("input[name=emailAddress]").val("frankie_knuckles@nyclol.com")
                    this.view.$("input[name=password]").val("whoaomg")
                    this.view.$("input[name=passwordConfirmation]").val("whoaomg")
                })

                it("creates a user with the forms attributes", function() {
                    this.view.$("form").submit();
                    expect(this.user.attributes["firstName"]).toBe("Frankie")
                    expect(this.user.attributes["lastName"]).toBe("Knuckles")
                    expect(this.user.attributes["userName"]).toBe("frankie2002")
                    expect(this.user.attributes["emailAddress"]).toBe("frankie_knuckles@nyclol.com")
                    expect(this.user.attributes["password"]).toBe("whoaomg")
                    expect(this.user.attributes["passwordConfirmation"]).toBe("whoaomg")
                });

                context("saving the user", function() {
                    beforeEach(function() {
                        spyOn(this.user, "save")
                    })

                    it("saves the user", function() {
                        this.view.$("form").submit();
                        expect(this.user.save).toHaveBeenCalled()
                    })


                    context("when user creation is successful", function() {
                        it("redirects to user index", function() {
                            spyOn(chorus.router, "navigate");
                            this.view.model.trigger("saved");
                            expect(chorus.router.navigate).toHaveBeenCalledWith("/users", true);
                        });
                    })

                    context("when user creation is fails", function() {
                        beforeEach(function() {
                            this.view.model.set({ errors : [
                                { message: "Hi there" }
                            ] });
                        });

                        it("displays the error message", function() {
                            expect(this.view.$(".errors").text()).toContain("Hi there")
                        });

                        it("doesn't redirect", function() {
                            expect(this.view.$("form")).toExist();
                        })
                    })
                })

            })
        });

        context("as a non admin", function() {
            beforeEach(function() {
                setLoggedInUser({'admin': false});
                this.view = new chorus.views.UserNew();
                this.view.render();
            });


            it("renders the admin-only warning", function() {
                expect(this.view.$(".aint_admin")).toExist();
            });
        });
    })
})