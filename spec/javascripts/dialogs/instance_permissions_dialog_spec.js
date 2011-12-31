describe("chorus.dialogs.InstancePermissions", function() {
    beforeEach(function() {
        fixtures.model = "Instance";
    })

    describe("#setup", function() {
        beforeEach(function() {
            this.model = fixtures.modelFor("fetchWithSharedAccount");
            this.dialog = new chorus.dialogs.InstancePermissions({ pageModel : this.model })
        })

        it("fetches the account map for the instance", function() {
            expect(this.server.requests[0].url).toBe("/edc/instance/accountmap?instanceId=10000")
        })

        it("does not re-render on model changes", function() {
            expect(this.dialog.persistent).toBeTruthy();
        })
    })

    context("when the instance is a shared account", function() {
        beforeEach(function() {
            this.model = fixtures.modelFor("fetchWithSharedAccount");
            this.dialog = new chorus.dialogs.InstancePermissions({ pageModel : this.model })
        })

        describe("#render", function() {
            beforeEach(function() {
                this.dialog.render();
            })

            it("displays the shared account subheader", function() {
                expect(this.dialog.$(".sub_header .details_text").text()).toMatchTranslation("instances.shared_account")
                expect(this.dialog.$(".sub_header a").text()).toMatchTranslation("instances.permissions_dialog.switch_to_individual")
            })

            it("displays the account owner information", function() {
                var li = this.dialog.$("li");
                expect(li).toExist();
                expect(li.find("img.profile")).toHaveAttr("src", this.model.owner().imageUrl());
                expect(li.find(".name").text()).toBe(this.model.owner().get("fullName"))
            })

            it("displays an edit link", function() {
                expect(this.dialog.$("a.edit")).toExist();
            })

            it("populates the dbUserName text field from the account map", function() {
                expect(this.dialog.$("input[name=dbUserName]").val()).toBe("the_dude")
            })
        })

        describe("editing the shared account credentials", function() {
            beforeEach(function() {
                this.dialog.render();
                this.dialog.$("a.edit").click();
                this.dialog.$("li[data-id=10111] input[name=dbUserName]").val("jughead");
                this.dialog.$("input[name=dbPassword]").val("gogogo");
            })

            it("adds the 'editing' class to the parent li", function() {
                expect(this.dialog.$("li")).toHaveClass("editing");
            })

            describe("saving the credentials", function() {
                beforeEach(function() {
                    spyOn(this.dialog.model, "save").andCallThrough();
                    this.dialog.$("a.save").click();
                })

                it("populates the account map from the form", function() {
                    expect(this.dialog.model.get("dbUserName")).toBe("jughead");
                    expect(this.dialog.model.get("dbPassword")).toBe("gogogo");
                })

                it("saves the acccount map", function() {
                    expect(this.dialog.model.save).toHaveBeenCalled();
                })

                it("shows a spinner", function() {
                    expect(this.dialog.$("a.save").isLoading()).toBeTruthy();
                })

                context("when the save succeeds", function() {
                    beforeEach(function() {
                        this.dialog.model.trigger('saved');
                    })

                    it("removes the 'editing' class from the parent li", function() {
                        expect(this.dialog.$("li")).not.toHaveClass("editing");
                    })

                    it("stops the spinner", function() {
                        expect(this.dialog.$("a.save").isLoading()).toBeFalsy();
                    })
                })

                context("when the save fails", function() {
                    beforeEach(function() {
                        this.dialog.model.set({ serverErrors : [
                            {
                                "message": "You can't do that, dude"
                            }
                        ]})

                        this.dialog.model.trigger('saveFailed');
                    })

                    it("does not remove the 'editing' class from the parent li", function() {
                        expect(this.dialog.$("li")).toHaveClass("editing");
                    })

                    it("displays error messages", function() {
                        expect(this.dialog.$(".errors li:first-child").text().trim()).toBe("You can't do that, dude");
                    })

                    it("stops the spinner", function() {
                        expect(this.dialog.$("a.save").isLoading()).toBeFalsy();
                    })
                })
            })

            describe("cancelling the credential editing", function() {
                beforeEach(function() {
                    spyOn(this.dialog.model, "save");
                    this.dialog.$("a.cancel").click();
                })

                it("does not populate the account map from the form", function() {
                    expect(this.dialog.model.get("dbUserName")).not.toBe("jughead");
                    expect(this.dialog.model.get("dbPassword")).not.toBe("gogogo");
                })
                
                it("does not save the account map", function() {
                    expect(this.dialog.model.save).not.toHaveBeenCalled();
                })

                it("removes the 'editing' class from the parent li", function() {
                    expect(this.dialog.$("li")).not.toHaveClass("editing");
                })
            })
        })
    });
});