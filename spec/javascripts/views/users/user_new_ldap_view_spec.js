describe("chorus.views.UserNewLdap", function() {
    describe("#render", function() {
        context("as an admin", function() {
            beforeEach(function() {
                setLoggedInUser({'admin': true});
                this.user = new chorus.models.User()
                this.user.ldap = true;
                this.view = new chorus.views.UserNewLdap({ model : this.user });
                this.view.render();
            });

            it("has a link to check whether the user is in the ldap database", function() {
                expect(this.view.$("a.check_username")).toExist();
            });

            it("doesn't re-render when the model fails to save", function() {
                expect(this.view.persistent).toBeTruthy();
            });

            describe("clicking the 'check username' link", function() {
                beforeEach(function() {
                    this.view.$("input[name='userName']").val("john_henry");
                    this.view.$("a.check_username").trigger("click");

                    this.ldapUsers = new chorus.collections.LdapUserSet([], { userName: "john_henry" });
                });

                it("sends a request to check for the existence of a user with the given username", function() {
                    expect(this.ldapUsers).toHaveBeenFetched();
                });

                context("when the username matches an LDAP user", function() {
                    beforeEach(function() {
                        this.server.completeFetchFor(this.ldapUsers, [
                            fixtures.user({
                                userName: "john_henry",
                                firstName: "John",
                                lastName: "Henry",
                                emailAddress: "jh@hammer.edu",
                                title: "Hammerer",
                                ou: "whoop-ass"
                            })
                        ]);
                    });

                    it("fills in the fields from the LDAP user", function() {
                        expect(this.view.$("input[name='firstName']").val()).toBe("John");
                        expect(this.view.$("input[name='lastName']").val()).toBe("Henry");
                        expect(this.view.$("input[name='emailAddress']").val()).toBe("jh@hammer.edu");
                        expect(this.view.$("input[name='title']").val()).toBe("Hammerer");
                        expect(this.view.$("input[name='ou']").val()).toBe("whoop-ass");
                    });
                });

                context("when no user with the given username is found", function() {
                    beforeEach(function() {
                        this.modalSpy = stubModals();
                        this.server.completeFetchFor(this.ldapUsers, []);
                    });

                    it("launches an alert dialog", function() {
                        expect(this.modalSpy).toHaveModal(chorus.alerts.NoLdapUser);
                    });
                });
            });

            context("submitting the form", function() {
                beforeEach(function() {
                    this.view.$("input[name=firstName]").val("Frankie");
                    this.view.$("input[name=lastName]").val("Knuckles");
                    this.view.$("input[name=userName]").val("frankie2002");
                    this.view.$("input[name=emailAddress]").val("frankie_knuckles@nyclol.com");
                    this.view.$("input[name=ou]").val("awesomeness dept");
                    this.view.$("input[name=admin]").prop("checked", true);
                })

                it("creates a user with the form's attributes", function() {
                    this.view.$("form").submit();

                    expect(this.user.attributes["firstName"]).toBe("Frankie");
                    expect(this.user.attributes["lastName"]).toBe("Knuckles");
                    expect(this.user.attributes["userName"]).toBe("frankie2002");
                    expect(this.user.attributes["emailAddress"]).toBe("frankie_knuckles@nyclol.com");
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

                context("when the data is valid", function() {
                    it("saves the user", function() {
                        this.view.$("form").submit();
                        expect(this.user).toHaveBeenCreated();
                    });

                    context("when user creation is successful", function() {
                        it("redirects to user index", function() {
                            spyOn(chorus.router, "navigate");
                            this.server.completeSaveFor(this.user);
                            expect(chorus.router.navigate).toHaveBeenCalledWith("/users", true);
                        });
                    });

                    context("when user creation fails on the server", function() {
                        beforeEach(function() {
                            this.view.model.serverErrors = [
                                {message : "Hi there"}
                            ];
                            this.view.$("form").submit();
                            this.view.model.trigger("saveFailed");

                            this.view.render();
                        });

                        it("doesn't redirect", function() {
                            expect(this.view.$("form")).toExist();
                        })

                        it("retains the data already entered", function() {
                            expect(this.view.$("input[name=firstName]").val()).toBe("Frankie");
                            expect(this.view.$("input[name=lastName]").val()).toBe("Knuckles");
                            expect(this.view.$("input[name=userName]").val()).toBe("frankie2002");
                            expect(this.view.$("input[name=emailAddress]").val()).toBe("frankie_knuckles@nyclol.com");
                            expect(this.view.$("input[name=ou]").val()).toBe("awesomeness dept");
                            expect(this.view.$("input[name=admin]")).toBeChecked();
                        });
                    })
                });

                context("when the form has extra whitespace around an input", function(){
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

