describe("chorus.dialogs.InstancePermissions", function() {
    describe("#setup", function() {
        beforeEach(function() {
            this.model = fixtures.instanceWithSharedAccount();
            this.dialog = new chorus.dialogs.InstancePermissions({ pageModel : this.model })
        })

        it("does not re-render on model changes", function() {
            expect(this.dialog.persistent).toBeTruthy();
        })
    })

    context("when the instance is a shared account", function() {
        beforeEach(function() {
            this.model = fixtures.instanceWithSharedAccount();
            this.model.accounts().reset(fixtures.instanceAccount(this.model))
            this.dialog = new chorus.dialogs.InstancePermissions({ pageModel : this.model })
        })

        describe("#render", function() {
            beforeEach(function() {
                stubModals();
                this.dialog.launchModal();
            })

            it("displays the shared account subheader", function() {
                expect(this.dialog.$(".sub_header .details_text").text()).toMatchTranslation("instances.shared_account")
            })

            it("displays the account owner information", function() {
                var li = this.dialog.$("li");
                var sharedAccountUser = this.model.sharedAccount().user();
                expect(li).toExist();
                expect(li.find("img.profile")).toHaveAttr("src", sharedAccountUser.imageUrl());
                expect(li.find(".name").text()).toBe(sharedAccountUser.displayName());
            })

            it("displays an edit link", function() {
                expect(this.dialog.$("a.edit")).toExist();
            })

            it("populates the dbUserName text field from the account map", function() {
                expect(this.dialog.$("input[name=dbUserName]").val()).toBe(this.model.sharedAccount().get('dbUserName'));
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
                        expect(this.server.requests[0].url).toBe("/edc/instance/accountmap/999")
                        expect(this.server.requests[0].requestBody).toBe("id=999&shared=no");
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

    });

    context("when the instance has individual accounts", function() {
        beforeEach(function() {
            this.model = fixtures.instance();
            this.accounts = this.model.accounts();
            this.accounts.add([
                fixtures.instanceAccount({ id: '1', user: { firstName: "bob", lastName: "zzap" } }),
                fixtures.instanceAccount({ id: '2', user: { firstName: "jim", lastName: "aardvark" } })
            ]);
            this.dialog = new chorus.dialogs.InstancePermissions({ pageModel : this.model })
            this.dialog.render();
        });

        it("does not display the 'switch to individual accounts' link", function() {
            expect(this.dialog.$("a.alert[data-alert=RemoveSharedAccount]")).not.toExist();
        });

        it("displays the name of each account's user", function() {
            expect(this.dialog.$("li[data-id=1] .name")).toHaveText("bob zzap");
            expect(this.dialog.$("li[data-id=2] .name")).toHaveText("jim aardvark");
        });

        xit("sorts the users by last name", function() {
            expect(this.dialog.$("li").eq(0)).toHaveText("jim aardvark");
            expect(this.dialog.$("li").eq(1)).toHaveText("bob zzap");
        });

        describe("editing a user's account credentials", function() {
            beforeEach(function() {
                this.accountBeingEdited = this.accounts.get(2);
                this.otherAccount = this.accounts.get(1);
                this.liBeingEdited = this.dialog.$("li[data-id=2]");
                this.otherLi = this.dialog.$("li[data-id=1]");
                this.liBeingEdited.find("a.edit").click();
                this.liBeingEdited.find("input[name=dbUserName]").val("jughead");
                this.liBeingEdited.find("input[name=dbPassword]").val("gogogo");
            });

            it("adds the 'editing' class to the parent li", function() {
                expect(this.liBeingEdited).toHaveClass("editing");
                expect(this.dialog.$('li.editing').length).toBe(1);
            })

            describe("saving the credentials with valid data", function() {
                beforeEach(function() {
                    spyOn(this.otherAccount, "save");
                    spyOn(this.accountBeingEdited, "save").andCallThrough();
                    this.liBeingEdited.find("a.save").click();
                })

                it("populates the account map from the form", function() {
                    expect(this.accountBeingEdited.get("dbUserName")).toBe("jughead");
                    expect(this.accountBeingEdited.get("dbPassword")).toBe("gogogo");
                })

                it("saves the acccount map", function() {
                    expect(this.accountBeingEdited.save).toHaveBeenCalled();
                    expect(this.otherAccount.save).not.toHaveBeenCalled();
                })

                it("shows a spinner", function() {
                    expect(this.liBeingEdited.find("a.save").isLoading()).toBeTruthy();
                    expect(this.otherLi.find("a.save").isLoading()).toBeFalsy();
                })

                describe("when the save succeeds", function() {
                    beforeEach(function() {
                        spyOn(this.dialog.instance, "fetch");
                        this.accountBeingEdited.trigger('saved');
                    })

                    it("removes the 'editing' class from the parent li", function() {
                        expect(this.liBeingEdited).not.toHaveClass("editing");
                    })

                    it("stops the spinner", function() {
                        expect(this.liBeingEdited.find("a.save").isLoading()).toBeFalsy();
                    })

                    it("re-fetches the instance", function() {
                        expect(this.dialog.instance.fetch).toHaveBeenCalled();
                    })
                })

                describe("when the save fails", function() {
                    beforeEach(function() {
                        this.accountBeingEdited.set({ serverErrors : [
                            {
                                "message": "You can't do that, dude"
                            }
                        ]})

                        this.accountBeingEdited.trigger('saveFailed');
                    })

                    it("does not remove the 'editing' class from the parent li", function() {
                        expect(this.liBeingEdited).toHaveClass("editing");
                    })

                    it("displays error messages", function() {
                        expect(this.dialog.$(".errors li:first-child").text().trim()).toBe("You can't do that, dude");
                    })

                    it("stops the spinner", function() {
                        expect(this.liBeingEdited.find("a.save").isLoading()).toBeFalsy();
                    })
                })

                describe("when validation fails", function() {
                    beforeEach(function() {
                        this.accountBeingEdited.trigger("validationFailed");
                    });

                    it("removes the spinner from the link", function() {
                        expect(this.liBeingEdited.find("a.save").isLoading()).toBeFalsy();
                    });
                });
            });

            describe("cancelling the credential editing", function() {
                beforeEach(function() {
                    spyOn(this.accountBeingEdited, "save");
                    this.liBeingEdited.find("a.cancel").click();
                })

                it("does not populate the account from the form", function() {
                    expect(this.accountBeingEdited.get("dbUserName")).not.toBe("jughead");
                    expect(this.accountBeingEdited.get("dbPassword")).not.toBe("gogogo");
                })

                it("does not save the account", function() {
                    expect(this.accountBeingEdited.save).not.toHaveBeenCalled();
                })

                it("removes the 'editing' class from the parent li", function() {
                    expect(this.liBeingEdited).not.toHaveClass("editing");
                })
            })
        })
    });
});
