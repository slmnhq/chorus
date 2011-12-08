describe("chorus.views.userEdit", function() {
    beforeEach(function() {
        this.loadTemplate("user_edit");
        this.loadTemplate("image_upload");
        this.loadTemplate("errors")

        chorus.session = new chorus.models.Session();
        setLoggedInUser({'userName': 'edcadmin'})
        fixtures.model = 'User';
        this.user = new chorus.models.User()
        this.view = new chorus.views.UserEdit({model : this.user});
        this.view.model.set(fixtures.jsonFor('fetch').resource[0]);
        this.view.model.loaded = true;
    })

    describe("#setup", function() {
        it("instantiates an ImageUpload view with the model", function() {
            var imageUpload = this.view.imageUpload;
            expect(imageUpload instanceof chorus.views.ImageUpload).toBeTruthy();
            expect(imageUpload.model).toBe(this.view.model);
        });
    });

    describe("#render", function() {
        context("when editing yourself", function() {
            context("as an admin", function() {
                beforeEach(function() {

                    setLoggedInUser({'admin': true});
                    this.view.render();
                });

                context("load the form with proper values", function() {
                    it("load a user with the forms attributes", function() {
                        expect(this.view.$("input[name=firstName]").val()).toBe("EDC");
                        expect(this.view.$("input[name=lastName]").val()).toBe("Admin");
                        expect(this.view.$("span[name=userName]").text()).toBe("edcadmin");
                        expect(this.view.$("input[name=emailAddress]").val()).toBe("edcadmin@example.com");
                        expect(this.view.$("input[name=title]").val()).toBe("");
                        expect(this.view.$("textarea[name=notes]").text()).toBe("");
                        expect(this.view.$("input[name=ou]").val()).toBe("");
                        expect(this.view.$("input[name=admin]").prop("checked")).toBe(true);
                    })
                })

                context("submitting the form", function() {
                    beforeEach(function() {
                        this.view.$("input[name=firstName]").val("Frankie");
                        this.view.$("input[name=emailAddress]").val("frankie_knuckles@nyclol.com");
                        this.view.$("input[name=ou]").val("awesomeness dept");
                        this.view.$("textarea[name=notes]").text("Here are some notes\n more than one line")
                        this.view.$("form").submit();
                    });

                    context("saving the user with valid data", function() {
                        beforeEach(function() {
                            spyOn(this.user, "save").andCallThrough()
                        });

                        it("modify the user with the form attributes", function() {
                            expect(this.user.attributes["firstName"]).toBe("Frankie");
                            expect(this.user.attributes["lastName"]).toBe("Admin");
                            expect(this.user.attributes["userName"]).toBe("edcadmin");
                            expect(this.user.attributes["emailAddress"]).toBe("frankie_knuckles@nyclol.com");
                            expect(this.user.attributes["ou"]).toBe("awesomeness dept");
                            expect(this.user.attributes["admin"]).toBe(true);
                            expect(this.user.attributes["notes"]).toBe("Here are some notes\n more than one line");
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

                        it("saves the user", function() {
                            this.view.$("form").submit();
                            expect(this.user.save).toHaveBeenCalled()
                        });

                        context("when user creation is successful", function() {
                            it("redirects to user index", function() {
                                spyOn(chorus.router, "navigate");
                                this.view.model.trigger("saved");
                                expect(chorus.router.navigate).toHaveBeenCalledWith(this.view.model.showUrl(), true);
                            });
                        })
                    });

                    context("when user creation fails on the server", function() {
                        beforeEach(function() {
                            this.view.model.serverErrors = [
                                {message : "Hi there"}
                            ];
                            this.view.model.trigger("saveFailed")
                        });

                        it("doesn't redirect", function() {
                            expect(this.view.$("form")).toExist();
                        });

                        it("retains the data already entered", function() {
                            expect(this.view.$("input[name=firstName]").val()).toBe("Frankie");
                        });
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

                        it("does not change the local model", function() {
                            expect(this.view.model.get("emailAddress")).not.toBe("bademail");
                        })
                    });

                    context("the form has extra whitespace around an input", function() {
                        beforeEach(function() {
                            this.view.$("input[name=firstName]").val("     spaces     ");
                            this.view.$("form").submit();
                        });

                        it("trims the whitespace before submission", function() {
                            expect(this.user.attributes["firstName"]).toBe("spaces");
                        });
                    });

                });

                context("cancelling", function() {
                    beforeEach(function() {
                        spyOn(this.view.$("form")[0], "submit");
                        spyOn(window.history, "back");
                        this.view.$("button.cancel").click();
                    })

                    it("does not submit the form", function() {
                        expect(this.view.$("form")[0].submit).not.toHaveBeenCalled();
                    })

                    it("navigates back", function() {
                        expect(window.history.back).toHaveBeenCalled();
                    })
                })
            });

            context("as a non admin", function() {
                beforeEach(function() {
                    setLoggedInUser({'admin': false});
                    this.view.render();
                });

                it("does not display the admin checkbox", function() {
                    expect(this.view.$("input[name=admin]")).not.toExist();
                });
            });

            it("has an .image_upload element", function() {
                expect(this.view.$(".image_upload")).toExist();
            });

            it("shows the correct action text on image upload", function() {
                expect(this.view.$(".image_upload a.action").text()).toMatchTranslation("users.edit_photo");
            })
        });

        context("editing a user that is not yourself", function() {
            beforeEach(function() {
                fixtures.model = 'User';
                this.user = new chorus.models.User()
                this.view = new chorus.views.UserEdit({model : this.user});
                this.view.model.set(fixtures.jsonFor('fetch').resource[0]);

                this.view.model.loaded = true;
                setLoggedInUser({'userName' : 'notedcadmin', 'admin': false})
                this.view.render();
            })
            it("renders the admin-only warning", function() {
                expect(this.view.$(".aint_admin")).toExist();
            });

            context("as an admin", function() {
                beforeEach(function() {
                    setLoggedInUser({'userName' : 'notedcadmin', 'admin': true})
                    this.view.render();
                })
                it("gives you permission to edit the user", function() {
                    expect(this.view.$(".aint_admin")).not.toExist();
                    expect(this.view.$("input[name=firstName]").val()).toBe("EDC");
                    expect(this.view.$("input[name=lastName]").val()).toBe("Admin");
                    expect(this.view.$("span[name=userName]").text()).toBe("edcadmin");
                })
            })
        })
    });
});

