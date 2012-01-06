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
                stubModals();
                this.dialog.launchModal();
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

            it("displays a 'switch to individual account' link", function() {
                expect(this.dialog.$("a.alert[data-alert=RemoveSharedAccount]").text().trim()).toMatchTranslation("instances.permissions_dialog.switch_to_individual");
            });

            context("clicking the switch to individual account link", function() {
                beforeEach(function() {
                    spyOn(this.dialog, "launchSubModal").andCallThrough();
                    this.dialog.account = fixtures.instanceAccount({ shared : "yes", dbUserName : "foo", id : "999" });
                    this.dialog.$("a.alert").click();
                });

                it("launches the Remove Shared Account dialog", function() {
                    expect(this.dialog.launchSubModal).toHaveBeenCalled();
                    expect(this.dialog.launchSubModal.calls[0].args[0] instanceof chorus.alerts.RemoveSharedAccount).toBeTruthy();
                });

                context("when the alert is confirmed", function() {
                    beforeEach(function() {
                        spyOn(this.dialog.account, "save").andCallThrough();
                        this.dialog.launchSubModal.calls[0].args[0].confirmAlert();
                    });

                    it("calls save on the account with shared:no", function() {
                        expect(this.dialog.account.save.calls[0].args[0].shared).toBe("no");
                    });

                    it("only sends the shared parameter", function() {
                        expect(this.server.requests[1].url).toBe("/edc/instance/accountmap/999")
                        expect(this.server.requests[1].requestBody).toBe("id=999&shared=no");
                    })

                    context("when the save succeeds", function() {
                        beforeEach(function() {
                            spyOn(chorus, 'toast');
                            this.otherSavedSpy = jasmine.createSpy();
                            this.dialog.model.bind("saved", this.otherSavedSpy);
                            this.dialog.model.trigger("saved");
                        });

                        it("displays a toast message", function() {
                            expect(chorus.toast).toHaveBeenCalledWith("instances.shared_account_removed");
                            expect(this.otherSavedSpy).toHaveBeenCalled();
                        });

                        context("and the same model saves again", function() {
                            it("doesn't display a toast message", function() {
                                chorus.toast.reset();
                                this.otherSavedSpy.reset();
                                this.dialog.model.trigger("saved");

                                expect(chorus.toast).not.toHaveBeenCalled();
                                expect(this.otherSavedSpy).toHaveBeenCalled();
                            });
                        });
                    });

                    context("when the save fails", function() {
                        beforeEach(function() {
                            spyOn(chorus, 'toast');
                            this.dialog.model.trigger("saveFailed");
                        });

                        it("displays a save failed toast message", function() {
                            expect(chorus.toast).toHaveBeenCalledWith("instances.shared_account_remove_failed");
                        });

                        context("and then a save succeeds", function() {
                            beforeEach(function() {
                                chorus.toast.reset();
                                this.dialog.model.trigger("saved");
                            });

                            it("doesn't display the saved toast message", function() {
                                expect(chorus.toast).not.toHaveBeenCalledWith("instances.shared_account_removed");

                            });
                        })
                    })
                });
            });
        })

        describe("editing the shared account credentials", function() {
            beforeEach(function() {
                this.dialog.render();
                this.dialog.$("a.edit").click();
                this.dialog.$("li input[name=dbUserName]").val("jughead");
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
                        spyOn(this.dialog.instance, "fetch");
                        this.dialog.model.trigger('saved');
                    })

                    it("removes the 'editing' class from the parent li", function() {
                        expect(this.dialog.$("li")).not.toHaveClass("editing");
                    })

                    it("stops the spinner", function() {
                        expect(this.dialog.$("a.save").isLoading()).toBeFalsy();
                    })

                    it("re-fetches the instance", function() {
                        expect(this.dialog.instance.fetch).toHaveBeenCalled();
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

                context("when the form is invalid", function() {
                    beforeEach(function() {
                        this.dialog.$("li[data-id=10111] input[name=dbUserName]").val("");
                        this.dialog.$("input[name=dbPassword]").val("");
                        this.dialog.$("a.save").click();
                    });

                    it("removes the spinner from the link", function() {
                        expect(this.dialog.$("a.save").isLoading()).toBeFalsy();
                    });
                });
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
})
    ;