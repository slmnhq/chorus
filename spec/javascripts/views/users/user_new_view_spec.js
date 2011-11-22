describe("chorus.views.UserNewMain", function() {

    it("doesn't cache", function() {
        expect(new chorus.views.UserNewMain().content).not.toBe(new chorus.views.UserNewMain().content);
    })

    it("is hella happy", function() {
        this.loadTemplate("main_content")
        this.loadTemplate("default_content_header")
        this.loadTemplate("plain_text")
        this.loadTemplate("validating");

        var view = new chorus.views.UserNewMain()
        view.render()
    })

})
describe("chorus.views.userNew", function() {
    beforeEach(function() {
        this.loadTemplate("user_new");
        this.loadTemplate("errors")
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
                    this.view.$("input[name=firstName]").val("Frankie");
                    this.view.$("input[name=lastName]").val("Knuckles");
                    this.view.$("input[name=userName]").val("frankie2002");
                    this.view.$("input[name=emailAddress]").val("frankie_knuckles@nyclol.com");
                    this.view.$("input[name=password]").val("whoaomg");
                    this.view.$("input[name=passwordConfirmation]").val("whoaomg");
                    this.view.$("input[name=ou]").val("awesomeness dept");
                    this.view.$("input[name=admin]").prop("checked", true);
                })

                it("creates a user with the forms attributes", function() {
                    this.view.$("form").submit();
                    expect(this.user.attributes["firstName"]).toBe("Frankie");
                    expect(this.user.attributes["lastName"]).toBe("Knuckles");
                    expect(this.user.attributes["userName"]).toBe("frankie2002");
                    expect(this.user.attributes["emailAddress"]).toBe("frankie_knuckles@nyclol.com");
                    expect(this.user.attributes["password"]).toBe("whoaomg");
                    expect(this.user.attributes["passwordConfirmation"]).toBe("whoaomg");
                    expect(this.user.attributes["ou"]).toBe("awesomeness dept");
                    expect(this.user.attributes["admin"]).toBe(true);
                });

                context("when the user form has admin unchecked", function() {
                    beforeEach(function() {
                        this.view.$("input[name=admin]").prop("checked", false);
                    });

                    it("sets the user attribute 'admin' to false", function() {
                        this.view.$("form").submit();
                        expect(this.user.attributes["admin"]).toBe(false);
                    });
                });

                context("saving the user with valid data", function() {
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

                    context("when user creation fails on the server", function() {
                        beforeEach(function() {
                            this.view.model.serverErrors = [
                                {message : "Hi there"}
                            ];
                            this.view.model.trigger("saveFailed")
                        });

                        it("doesn't redirect", function() {
                            expect(this.view.$("form")).toExist();
                        })

                        it("retains the data already entered", function() {
                            expect(this.view.$("input[name=firstName]").val()).toBe("Frankie");
                        });
                    })
                });

                context("saving the user with invalid data", function() {
                    beforeEach(function() {
                        spyOn(Backbone.Model.prototype, 'save');
                        this.view.$("input[name=emailAddress]").val("bademail");
                        this.view.$("form").submit();
                    });
                    it("does not save the user", function() {
                        expect(Backbone.Model.prototype.save).not.toHaveBeenCalled();
                    });

                    it("retains the data already entered", function() {
                        expect(this.view.$("input[name=firstName]").val()).toBe("Frankie");
                    });
                });

                context("the form has extra whitespace around an input", function(){
                    beforeEach(function(){
                        this.view.$("input[name=firstName]").val("     spaces     ");
                        this.view.$("form").submit();
                    });

                    it("trims the whitespace before submission", function(){
                        expect(this.user.attributes["firstName"]).toBe("spaces");
                    });
                });

            });
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
