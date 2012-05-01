describe("chorus.views.UserNewLdap", function() {
    describe("#render", function() {
        context("as an admin", function() {
            beforeEach(function() {
                spyOn($.fn, "limitMaxlength")
                setLoggedInUser({'admin': true});
                this.user = new chorus.models.User()
                this.view = new chorus.views.UserNewLdap({ model: this.user });
                this.modalSpy = stubModals();
                this.view.render();
            });

            it("is an LDAP user", function() {
                expect(this.user.ldap).toBeTruthy();
            });

            it("limits the length of the notes field", function() {
                expect($.fn.limitMaxlength).toHaveBeenCalledOnSelector("textarea");
            })

            describe("#fieldValues", function() {
                beforeEach(function() {
                    this.view.$("input[name=first_name]").val("Frankie");
                    this.view.$("input[name=last_name]").val("Knuckles");
                    this.view.$("input[name=username]").val("frankie2002");
                    this.view.$("input[name=emailAddress]").val("frankie_knuckles@nyclol.com");
                    this.view.$("input[name=ou]").val("awesomeness dept");
                    this.view.$("input[name=title]").val("fashion policeman");
                    this.view.$("input[name=admin]").prop("checked", true);
                    this.view.$("textarea[name=notes]").val("some notes");
                });

                it("includes the values of every input in the form", function() {
                    expect(this.view.fieldValues()).toEqual({
                        first_name: "Frankie",
                        last_name: "Knuckles",
                        username: "frankie2002",
                        emailAddress: "frankie_knuckles@nyclol.com",
                        ou: "awesomeness dept",
                        title: "fashion policeman",
                        admin: true,
                        notes: "some notes"
                    });
                });

                context("when the 'admin' box is checked", function() {
                    it("sets the 'admin' field to true", function() {
                        expect(this.view.fieldValues().admin).toBeTruthy();
                    });
                });

                context("when the 'admin' box is unchecked", function() {
                    it("sets the 'admin' field to false", function() {
                        this.view.$("input[name=admin]").prop("checked", false);
                        expect(this.view.fieldValues().admin).toBeFalsy();
                    });
                });

                context("when there is whitespace surrounding an input value", function() {
                    it("trims the whitespace before submission", function() {
                        this.view.$("input[name=first_name]").val("     spaces     ");
                        expect(this.view.fieldValues().first_name).toBe("spaces");
                    });
                });

                context("when there is whitespace surrounding a textarea value", function() {
                    it("does not trim the whitespace", function() {
                        this.view.$("textarea[name=notes]").val("     spaces     ");
                        expect(this.view.fieldValues().notes).toBe("     spaces     ");
                    });
                });
            });

            it("has a link to check whether the user is in the ldap database", function() {
                expect(this.view.$("a.check_username")).toExist();
                expect(this.view.$("a.check_username").text()).toMatchTranslation("users.ldap.check_username");
            });

            it("doesn't re-render when the model fails to save", function() {
                expect(this.view.persistent).toBeTruthy();
            });

            describe("clicking the 'check username' link", function() {
                beforeEach(function() {
                    this.view.$("input[name='username']").val("john_henry");
                    this.view.$("a.check_username").trigger("click");

                    this.ldapUsers = new chorus.collections.LdapUserSet([], { username: "john_henry" });
                });

                it("sends a request to check for the existence of a user with the given username", function() {
                    expect(this.ldapUsers).toHaveBeenFetched();
                });

                context("when the username matches an LDAP user", function() {
                    beforeEach(function() {
                        this.server.completeFetchFor(this.ldapUsers, [
                            newFixtures.user({
                                username: "john_henry",
                                first_name: "John",
                                last_name: "Henry",
                                emailAddress: "jh@hammer.edu",
                                title: "Hammerer",
                                ou: "whoop-ass"
                            })
                        ]);
                    });

                    it("fills in the fields from the LDAP user", function() {
                        expect(this.view.$("input[name='first_name']").val()).toBe("John");
                        expect(this.view.$("input[name='last_name']").val()).toBe("Henry");
                        expect(this.view.$("input[name='emailAddress']").val()).toBe("jh@hammer.edu");
                        expect(this.view.$("input[name='title']").val()).toBe("Hammerer");
                        expect(this.view.$("input[name='ou']").val()).toBe("whoop-ass");
                    });
                });

                context("when no user with the given username is found", function() {
                    beforeEach(function() {
                        this.server.completeFetchFor(this.ldapUsers, []);
                    });

                    it("launches an alert dialog", function() {
                        expect(this.modalSpy).toHaveModal(chorus.alerts.NoLdapUser);
                    });
                });
            });

            context("submitting the form", function() {
                beforeEach(function() {
                    this.view.$("input[name=first_name]").val("Frankie");
                    this.view.$("input[name=last_name]").val("Knuckles");
                    this.view.$("input[name=username]").val("frankie2002");
                    this.view.$("input[name=emailAddress]").val("frankie_knuckles@nyclol.com");
                    this.view.$("input[name=ou]").val("awesomeness dept");
                    this.view.$("input[name=admin]").prop("checked", true);

                    this.view.$("form").submit();

                    this.ldapUsers = new chorus.collections.LdapUserSet([], { username: "frankie2002" });
                })

                it("checks the LDAP username", function() {
                    expect(this.ldapUsers).toHaveBeenFetched();
                });

                describe("when the server responds to the LDAP username check", function() {
                    context("and the user exists", function() {
                        beforeEach(function() {
                            spyOn(this.view, 'fieldValues').andCallThrough()

                            this.server.completeFetchFor(this.ldapUsers, [
                                newFixtures.user({ username: "frankie2002" })
                            ]);
                        });

                        it("creates a user with the form's attributes", function() {
                            expect(this.view.fieldValues).toHaveBeenCalled();

                            expect(this.user.attributes["first_name"]).toBe("Frankie");
                            expect(this.user.attributes["last_name"]).toBe("Knuckles");
                            expect(this.user.attributes["username"]).toBe("frankie2002");
                            expect(this.user.attributes["emailAddress"]).toBe("frankie_knuckles@nyclol.com");
                            expect(this.user.attributes["ou"]).toBe("awesomeness dept");
                            expect(this.user.attributes["admin"]).toBe(true);
                        });

                        it("saves the user", function() {
                            expect(this.user).toHaveBeenCreated();
                        });

                        context("when user creation is successful", function() {
                            it("redirects to user index", function() {
                                spyOn(chorus.router, "navigate");
                                this.server.completeSaveFor(this.user);
                                expect(chorus.router.navigate).toHaveBeenCalledWith("/users");
                            });
                        });

                        context("when user creation fails on the server", function() {
                            beforeEach(function() {
                                this.view.model.serverErrors = [
                                    {message: "Hi there"}
                                ];
                                this.view.$("form").submit();
                                this.view.model.trigger("saveFailed");
                            });

                            it("doesn't redirect", function() {
                                expect(this.view.$("form")).toExist();
                            })

                            it("retains the data already entered", function() {
                                expect(this.view.$("input[name=first_name]").val()).toBe("Frankie");
                                expect(this.view.$("input[name=last_name]").val()).toBe("Knuckles");
                                expect(this.view.$("input[name=username]").val()).toBe("frankie2002");
                                expect(this.view.$("input[name=emailAddress]").val()).toBe("frankie_knuckles@nyclol.com");
                                expect(this.view.$("input[name=ou]").val()).toBe("awesomeness dept");
                                expect(this.view.$("input[name=admin]")).toBeChecked();
                            });

                            describe("check another user name", function(){
                                beforeEach(function() {
                                    this.view.$("input[name=username]").val("max");
                                    this.view.$("a.check_username").click();
                                });

                                it("clears the existing error", function() {
                                    expect(this.view.$(".errors")).toBeEmpty();
                                });
                            });
                        })
                    });

                    context("and the user does not exist", function() {
                        beforeEach(function() {
                            this.server.completeFetchFor(this.ldapUsers, []);
                        });

                        it("does not save the user", function() {
                            expect(this.user).not.toHaveBeenCreated();
                        });

                        it("launches an alert dialog", function() {
                            expect(this.modalSpy).toHaveModal(chorus.alerts.NoLdapUser);
                        });
                    });
                });
            });


            context("cancelling", function() {
                beforeEach(function() {
                    this.view.$("button.cancel").click();
                })

                it("does not save the user", function() {
                    expect(this.user).not.toHaveBeenCreated();
                })

                it("navigates back", function() {
                    expect(window.history.back).toHaveBeenCalled();
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

