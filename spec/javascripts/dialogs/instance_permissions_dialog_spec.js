describe("chorus.dialogs.InstancePermissions", function() {
    beforeEach(function() {
        spyOn(chorus, 'styleSelect');
        stubModals();
    });

    describe("#setup", function() {
        beforeEach(function() {
            spyOn(chorus.models.UserSet.prototype, 'fetchAll');
            this.instance = fixtures.instanceWithSharedAccount();
            this.dialog = new chorus.dialogs.InstancePermissions({ pageModel : this.instance })
        })

        it("does not re-render on model changes", function() {
            expect(this.dialog.persistent).toBeTruthy();
        })

        it("fetches all chorus users", function() {
            expect(this.dialog.users).toBeA(chorus.models.UserSet);
            expect(this.dialog.users.fetchAll).toHaveBeenCalled();
        });
    })

    context("when the instance is a shared account", function() {
        beforeEach(function() {
            this.instance = fixtures.instanceWithSharedAccount();
            var account = fixtures.instanceAccount(this.instance);
            this.instance.set({ ownerId: account.user().get("id") });
            this.instance.accounts().reset(account);

            this.dialog = new chorus.dialogs.InstancePermissions({ pageModel : this.instance })
        })

        describe("#render", function() {
            beforeEach(function() {
                this.dialog.launchModal();
            });

            it("displays the shared account subheader", function() {
                expect(this.dialog.$(".sub_header .details_text").text()).toMatchTranslation("instances.shared_account")
            })

            it("displays the account owner information", function() {
                var li = this.dialog.$("li");
                var sharedAccountUser = this.instance.sharedAccount().user();
                expect(li).toExist();
                expect(li.find("img.profile")).toHaveAttr("src", sharedAccountUser.imageUrl());
                expect(li.find(".name").text()).toBe(sharedAccountUser.displayName());
            })

            it("displays an edit link", function() {
                expect(this.dialog.$("a.edit")).toExist();
            })

            it("displays the Change owner link", function() {
                expect(this.dialog.$("a.change_owner")).toExist();
            })

            describe("clicking the 'change owner' link", function() {
                beforeEach(function() {
                    this.dialog.$("a.change_owner").click();
                });

                it("shows the user select", function() {
                    expect(this.dialog.$("select.name")).toExist();
                    expect(this.dialog.$(".select_container")).not.toHaveClass("hidden");
                });

                it("hides the non-editable user name", function() {
                    expect(this.dialog.$("div.name")).toHaveClass("hidden");
                });

                describe("when the user fetch completes", function() {
                    beforeEach(function() {
                        this.dialog.users.reset([
                            fixtures.user({ firstName: "jim", lastName: "aardvark", id: '222' }),
                            this.instance.owner(),
                            fixtures.user({ firstName: "harold", lastName: "four", id: '444' }),
                            fixtures.user({ firstName: "suzie", lastName: "three", id: '333' }),
                            fixtures.user({ firstName: "bob", lastName: "zzap", id: '111' })
                        ]);
                    });

                    it("includes every user's name  in the owner select", function() {
                        expect(this.dialog.$("select.name option").length).toBe(5);

                        expect(this.dialog.$("select.name option").eq(0)).toHaveText(this.dialog.users.get('222').displayName());
                        expect(this.dialog.$("select.name option").eq(1)).toHaveText(this.instance.owner().displayName());
                        expect(this.dialog.$("select.name option").eq(2)).toHaveText(this.dialog.users.get('444').displayName());
                        expect(this.dialog.$("select.name option").eq(3)).toHaveText(this.dialog.users.get('333').displayName());
                        expect(this.dialog.$("select.name option").eq(4)).toHaveText(this.dialog.users.get('111').displayName());
                    });

                    it("selects the current owner by default", function() {
                        expect(this.dialog.$("select.name").val()).toBe(this.instance.owner().get("id"));
                    });

                    it("displays the save owner options", function() {
                        expect(this.dialog.$("a.save_owner")).toExist();
                        expect(this.dialog.$("a.save_owner")).not.toHaveClass("hidden");
                    });

                    it("hides the 'edit' and 'change owner' links", function() {
                        expect(this.dialog.$("a.change_owner")).toHaveClass("hidden");
                        expect(this.dialog.$("a.edit")).toHaveClass("hidden");
                    });

                    it("hides the 'owner' text", function() {
                        expect(this.dialog.$("span.owner")).toHaveClass("hidden");
                    });

                    describe("clicking the cancel link", function() {
                        beforeEach(function() {
                            this.dialog.$("a.cancel_change_owner").click();
                        });

                        it("shows the 'edit' and 'change owner' links", function() {
                            expect(this.dialog.$("a.change_owner")).not.toHaveClass("hidden");
                            expect(this.dialog.$("a.edit")).not.toHaveClass("hidden");
                        });

                        it("shows the 'owner' text", function() {
                            expect(this.dialog.$("span.owner")).not.toHaveClass("hidden");
                        });
                    });

                    describe("choosing a new owner", function() {
                        beforeEach(function() {
                            spyOn(this.dialog, 'launchSubModal');
                            this.newOwner = this.dialog.users.get("222");
                            this.dialog.$("select.name").val("222");
                            this.dialog.$("a.save_owner").click();
                        });

                        itLaunchesTheConfirmChangeOwnerDialog();
                    });
                });
            });

            it("populates the dbUserName text field from the account map", function() {
                expect(this.dialog.$("input[name=dbUserName]").val()).toBe(this.instance.sharedAccount().get('dbUserName'));
            })

            it("displays a 'switch to individual account' link", function() {
                expect(this.dialog.$("a.remove_shared_account").text().trim()).toMatchTranslation("instances.permissions_dialog.switch_to_individual");
            });

            context("clicking the switch to individual account link", function() {
                beforeEach(function() {
                    spyOn(this.dialog, "launchSubModal").andCallThrough();
                    this.dialog.sharedAccount = fixtures.instanceAccount({ shared : "yes", dbUserName : "foo", id : "999" });
                    this.dialog.$("a.remove_shared_account").click();
                });

                it("launches the Remove Shared Account dialog", function() {
                    expect(this.dialog.launchSubModal).toHaveBeenCalled();
                    expect(this.dialog.launchSubModal.calls[0].args[0] instanceof chorus.alerts.RemoveSharedAccount).toBeTruthy();
                });

                context("when the alert is confirmed", function() {
                    beforeEach(function() {
                        spyOn(this.dialog.sharedAccount, "save").andCallThrough();
                        this.dialog.launchSubModal.calls[0].args[0].confirmAlert();
                    });

                    it("calls save on the account with shared:no", function() {
                        expect(this.dialog.sharedAccount.save.calls[0].args[0].shared).toBe("no");
                    });

                    it("only sends the shared parameter", function() {
                        expect(_.last(this.server.requests).url).toBe("/edc/instance/accountmap/999")
                        expect(_.last(this.server.requests).requestBody).toBe("id=999&shared=no");
                    })

                    context("when the save succeeds", function() {
                        beforeEach(function() {
                            spyOn(chorus, 'toast');
                            this.otherSavedSpy = jasmine.createSpy();
                            spyOn(this.dialog, "postRender").andCallThrough();
                            this.dialog.sharedAccount.bind("saved", this.otherSavedSpy);
                            expect(this.dialog.instance.has("sharedAccount")).toBeTruthy();
                            this.dialog.sharedAccount.trigger("saved");
                        });

                        it("displays a toast message", function() {
                            expect(chorus.toast).toHaveBeenCalledWith("instances.shared_account_removed");
                            expect(this.otherSavedSpy).toHaveBeenCalled();
                        });

                        it("clears shared account information from the instance model in the dialog", function() {
                            expect(this.dialog.instance.has("sharedAccount")).toBeFalsy();
                        })

                        it("re-renders the dialog in the new individual account state", function() {
                            expect(this.dialog.postRender).toHaveBeenCalled();
                        })

                        context("and the same model saves again", function() {
                            it("doesn't display a toast message", function() {
                                chorus.toast.reset();
                                this.otherSavedSpy.reset();
                                this.dialog.sharedAccount.trigger("saved");

                                expect(chorus.toast).not.toHaveBeenCalled();
                                expect(this.otherSavedSpy).toHaveBeenCalled();
                            });
                        });
                    });

                    context("when the save fails", function() {
                        beforeEach(function() {
                            spyOn(chorus, 'toast');
                            this.dialog.sharedAccount.trigger("saveFailed");
                        });

                        it("displays a save failed toast message", function() {
                            expect(chorus.toast).toHaveBeenCalledWith("instances.shared_account_remove_failed");
                        });

                        context("and then a save succeeds", function() {
                            beforeEach(function() {
                                chorus.toast.reset();
                                this.dialog.sharedAccount.trigger("saved");
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
            spyOn(chorus.models.UserSet.prototype, 'fetchAll').andCallThrough();
            this.owner = fixtures.user({firstName: 'EDC', lastName: 'Admin'});
            this.instance = fixtures.instance({ownerId: this.owner.get('id'), owner: this.owner.get('userName'), ownerFullName: this.owner.displayName()});
            this.accounts = this.instance.accounts();
            this.accounts.add([
                fixtures.instanceAccount({ id: '1', user: { firstName: "bob", lastName: "zzap", id: '111' } }),
                fixtures.instanceAccount({ id: '2', user: { firstName: "jim", lastName: "aardvark", id: '222' } }),
                fixtures.instanceAccount({ id: '3', user: this.owner})
            ]);
            this.dialog = new chorus.dialogs.InstancePermissions({ pageModel : this.instance })
            this.dialog.launchModal();

            var ownerAccountId = this.instance.accountForOwner().get('id');
            this.ownerLi = this.dialog.$("li[data-id="   + ownerAccountId + "]");
            this.otherLis = this.dialog.$("li[data-id!=" + ownerAccountId + "]");

            $('#jasmine_content').append(this.dialog.el);
        });

        it("only shows 'owner' in the row corresponding to the owner", function() {
            expect(this.ownerLi).toContain("span.owner");
            expect(this.otherLis).not.toContain("span.owner");
            expect(this.otherLis).not.toContainTranslation("instances.permissions.change_owner");
        });

        it("only shows the 'make owner' links for users that aren't already the owner", function() {
            expect(this.ownerLi).not.toContain("a.make_owner");
            expect(_.all(this.otherLis, function(li) { return $(li).find("a.make_owner") })).toBeTruthy();
        });

        it("does not display the 'switch to individual accounts' link", function() {
            expect(this.dialog.$("a.remove_shared_account")).not.toExist();
        });

        it("displays the 'switch to shared account' link", function() {
            expect(this.dialog.$("a.add_shared_account").text()).toMatchTranslation("instances.permissions_dialog.switch_to_shared");
        });

        it("shows the number of individual accounts", function() {
            expect(this.dialog.$(".sub_header .individual_accounts_count").text()).toMatchTranslation('instances.sidebar.x_individual_accounts', {count: 3});
        });

        it("shows the 'add an account' button", function() {
            expect(this.dialog.$(".sub_header button.add_account")).toExist();
        });

        it("displays the name of each account's user", function() {
            expect(this.dialog.$("li[data-id=1] .name")).toHaveText("bob zzap");
            expect(this.dialog.$("li[data-id=2] .name")).toHaveText("jim aardvark");
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
                        expect(this.dialog.$('li[data-id=2]')).not.toHaveClass("editing");
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
                        this.accountBeingEdited.serverErrors = [{ message: "You can't do that, dude" }];
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
            });

            describe("when clicking edit for another user", function() {
                beforeEach(function() {
                    spyOn(this.dialog, 'clearErrors');
                    this.otherLi.find('a.edit').click();
                });

                it("closes the first edit area while opening the new one", function() {
                    expect(this.liBeingEdited).not.toHaveClass('editing');
                    expect(this.otherLi).toHaveClass('editing');
                });

                it("clears the errors", function() {
                    expect(this.dialog.clearErrors).toHaveBeenCalled();
                })
            });
        });

        describe("when the chorus users are fetched", function() {
            beforeEach(function() {
                this.dialog.users.reset([
                    fixtures.user({ firstName: "jim", lastName: "aardvark", id: '222' }),
                    this.instance.owner(),
                    fixtures.user({ firstName: "harold", lastName: "four", id: '444' }),
                    fixtures.user({ firstName: "suzie", lastName: "three", id: '333' }),
                    fixtures.user({ firstName: "bob", lastName: "zzap", id: '111' })
                ]);
            });

            describe("when a 'make owner' link is clicked", function() {
                beforeEach(function() {
                    spyOn(this.dialog, 'launchSubModal');
                    this.newOwner = this.dialog.users.get("222");
                    this.liForNewOwner = this.dialog.$("li[data-id=2]"); // account for user with id 222
                    this.liForNewOwner.find("a.make_owner").click();
                });

                itLaunchesTheConfirmChangeOwnerDialog();
            });

            describe("when the 'add account' button is clicked", function() {
                beforeEach(function() {
                    this.dialog.$("button.add_account").click();
                    this.newLi = this.dialog.$("li:last");
                });

                it("adds an option in the user select, sorted, for each chorus user who does not already have permissions", function() {
                    expect(this.dialog.$("select.name option").eq(0)).toHaveText(this.dialog.users.get('444').displayName());
                    expect(this.dialog.$("select.name option").eq(1)).toHaveText(this.dialog.users.get('333').displayName());
                    expect(this.dialog.$("select.name option").length).toBe(2);
                });

                it("shows the user select", function() {
                    expect(this.newLi.find(".select_container")).not.toHaveClass("hidden");
                });

                it("adds a new item to the accounts list", function() {
                    expect(this.dialog.$("li").length).toBe(4);
                });

                it("puts the new item into edit mode", function() {
                    expect(this.newLi).toHaveClass("editing");
                });

                it("adds the 'new' class to the new li", function() {
                    expect(this.dialog.$("li:last")).toHaveClass("new");
                });

                it("does not reflect the user in the count at the top", function() {
                    expect(this.dialog.$('.individual_accounts_count')).toContainText(3);
                });

                it("disables the 'add account' button", function() {
                    expect(this.dialog.$("button.add_account")).toBeDisabled();
                    this.dialog.$("button.add_account").click();
                    expect(this.dialog.$("li").length).toBe(4);
                });

                it("displays the image for the selected user", function() {
                    var selectedUser = this.dialog.users.get(this.dialog.$('li[data-id=new] select').val());
                    expect(this.dialog.$('li[data-id=new] img.profile').attr('src')).toBe(selectedUser.imageUrl());
                });

                describe("selecting a new user", function() {
                    beforeEach(function() {
                        this.dialog.$('select').val('444');
                        this.dialog.$('select').trigger("change");
                    })

                    it("updates the image for that user", function() {
                        var selectedUser = this.dialog.users.get(this.dialog.$('li[data-id=new] select').val());
                        expect(this.dialog.$('li[data-id=new] img.profile').attr('src')).toBe(selectedUser.imageUrl());
                    })
                })

                describe("cancelling the new account", function() {
                    beforeEach(function() {
                        this.dialog.$("li.new a.cancel:visible").click();
                    });

                    it("enables the 'add account' button", function() {
                        expect(this.dialog.$("button.add_account")).not.toBeDisabled();
                    });

                    it("removes the new row", function() {
                        expect(this.dialog.$('li').length).toBe(3);
                    });

                    it("removes the model from the collection", function() {
                        expect(this.dialog.collection.length).toBe(3);
                    });
                });

                describe("saving the new account", function() {
                    context("with errors", function() {
                        beforeEach(function() {
                            this.dialog.$('a.save:visible').click();
                        });

                        it("shows errors", function() {
                            expect(this.dialog.$('input[name=dbUserName]:visible')).toHaveClass('has_error');
                            expect(this.dialog.$('input[name=dbPassword]:visible')).toHaveClass('has_error');
                        });
                    });

                    context("with valid form data", function() {
                        beforeEach(function() {
                            spyOn(this.dialog, "render").andCallThrough();
                            spyOn(this.dialog.account, "save").andCallThrough();
                            this.dialog.$('input[name=dbUserName]').val('badUser!');
                            this.dialog.$('input[name=dbPassword]').val('badPassword!');
                            this.dialog.$('li[data-id=new] input[name=dbUserName]').val('user!');
                            this.dialog.$('li[data-id=new] input[name=dbPassword]').val('password!');
                            this.dialog.$('li select').val('111');
                        });
                        context("clicking save", function() {
                            beforeEach(function() {
                                this.dialog.$('a.save:visible').click();
                            })

                            it("saves the correct fields", function() {
                                expect(this.dialog.account.save).toHaveBeenCalledWith({
                                    userId : '444',
                                    dbUserName : 'user!',
                                    dbPassword : 'password!'
                                });
                            });

                            it("has the correct instanceId", function() {
                                expect(this.dialog.account.get('instanceId')).toBe(this.dialog.instance.get('id'));
                            });

                            it("has the selected userId", function() {
                                expect(this.dialog.account.get('userId')).toBe('444');
                            });

                            context("after the save returns successfully", function() {
                                beforeEach(function() {
                                    this.completeSaveFor(this.dialog.account);
                                });

                                it("re-renders the dialog", function() {
                                    expect(this.dialog.render).toHaveBeenCalled();
                                });
                            })
                        })

                        context("pressing enter", function() {
                            beforeEach(function() {
                                this.dialog.$('a.save:visible').closest('form').submit();
                            });

                            it("saves the model", function() {
                                expect(this.dialog.account.save).toHaveBeenCalled();
                            });
                        });
                    });
                });

                describe("when clicking edit for another user", function() {
                    beforeEach(function() {
                        this.otherLi = this.dialog.$("li[data-id=1]");
                        this.otherLi.find('a.edit').click();
                    })
                    it("enables the 'add account' button", function() {
                        expect(this.dialog.$("button.add_account")).not.toBeDisabled();
                    });

                    it("removes the new row", function() {
                        expect(this.dialog.$('li').length).toBe(3);
                    });

                    it("removes the model from the collection", function() {
                        expect(this.dialog.collection.length).toBe(3);
                    });
                })

                describe("when the modal is closed", function() {
                    beforeEach(function() {
                        this.dialog.modalClosed();
                    });

                    it("removes the new model from the collection", function() {
                        expect(this.dialog.collection.length).toBe(3);
                    });
                });
            });
        });

        describe("when the 'add account' button is clicked (before the users are fetched)", function() {
            beforeEach(function() {
                expect(this.dialog.$("li").length).toBe(3);
                this.dialog.$("button.add_account").click();
            });

            describe("when the fetch for all chorus users completes", function() {
                beforeEach(function() {
                    this.dialog.users.reset([
                        fixtures.user({ firstName: "anna", lastName: "cannon" }),
                        fixtures.user({ firstName: "ben", lastName: "maulden" })
                    ]);
                });

                it("adds an option in the user select for each chorus user", function() {
                    expect(this.dialog.$("select.name option").eq(0)).toHaveText("anna cannon");
                    expect(this.dialog.$("select.name option").eq(1)).toHaveText("ben maulden");
                });
            });
        });

        context("clicking the switch to shared account link", function() {
            beforeEach(function() {
                spyOn(this.dialog, "launchSubModal").andCallThrough();
                this.ownerAccount = fixtures.instanceAccount({shared: 'no', dbUserName : "foo", id : "888"});
                spyOn(this.ownerAccount, "save").andCallThrough();
                spyOn(this.dialog.instance, 'accountForOwner').andReturn(this.ownerAccount);
                this.dialog.$("a.add_shared_account").click();
            });

            it("launches the Add Shared Account dialog", function() {
                expect(this.dialog.launchSubModal).toHaveBeenCalled();
                expect(this.dialog.launchSubModal.calls[0].args[0] instanceof chorus.alerts.AddSharedAccount).toBeTruthy();
            });

            context("when the alert is confirmed", function() {
                beforeEach(function() {
                    this.dialog.launchSubModal.calls[0].args[0].confirmAlert();
                });

                it("calls save on the account with shared:yes", function() {
                    expect(this.ownerAccount.save.calls[0].args[0].shared).toBe("yes");
                });

                it("only sends the shared parameter", function() {
                    expect(_.last(this.server.requests).url).toBe("/edc/instance/accountmap/888")
                    expect(_.last(this.server.requests).requestBody).toBe("id=888&shared=yes");
                })

                context("when the save succeeds", function() {
                    beforeEach(function() {
                        spyOn(chorus, 'toast');
                        this.otherSavedSpy = jasmine.createSpy();
                        spyOn(this.dialog, "postRender").andCallThrough();
                        this.ownerAccount.bind("saved", this.otherSavedSpy);
                        expect(this.dialog.instance.has("sharedAccount")).toBeTruthy();
                        this.ownerAccount.trigger("saved");
                    });

                    it("displays a toast message", function() {
                        expect(chorus.toast).toHaveBeenCalledWith("instances.shared_account_added");
                        expect(this.otherSavedSpy).toHaveBeenCalled();
                    });

                    it("clears shared account information from the instance model in the dialog", function() {
                        expect(this.dialog.instance.has("sharedAccount")).toBeFalsy();
                    })

                    it("re-renders the dialog in the new individual account state", function() {
                        expect(this.dialog.postRender).toHaveBeenCalled();
                    })

                    context("and the same model saves again", function() {
                        it("doesn't display a toast message", function() {
                            chorus.toast.reset();
                            this.otherSavedSpy.reset();
                            this.ownerAccount.trigger("saved");

                            expect(chorus.toast).not.toHaveBeenCalled();
                            expect(this.otherSavedSpy).toHaveBeenCalled();
                        });
                    });
                });

                context("when the save fails", function() {
                    beforeEach(function() {
                        spyOn(chorus, 'toast');
                        this.ownerAccount.trigger("saveFailed");
                    });

                    it("displays a save failed toast message", function() {
                        expect(chorus.toast).toHaveBeenCalledWith("instances.shared_account_add_failed");
                    });

                    context("and then a save succeeds", function() {
                        beforeEach(function() {
                            chorus.toast.reset();
                            this.ownerAccount.trigger("saved");
                        });

                        it("doesn't display the saved toast message", function() {
                            expect(chorus.toast).not.toHaveBeenCalledWith("instances.shared_account_added");
                        });
                    })
                })
            });
        });
    });

    context("when switching back and forth between shared and individual", function() {
        beforeEach(function() {
            this.instance = fixtures.instanceWithSharedAccount();
            this.dialog = new chorus.dialogs.InstancePermissions({ pageModel : this.instance });
        });

        it("handles confirmRemoveSharedAccount when dialog.sharedAccount does not exist", function() {
            delete this.dialog.sharedAccount;
            this.dialog.confirmRemoveSharedAccount();

            expect(this.dialog.sharedAccount).toBeDefined();
        });

    });

    // this shared example assumes that
    // - #launchSubModal is spied on
    // - this.newOwner is set
    function itLaunchesTheConfirmChangeOwnerDialog(options) {
        beforeEach(function() {
            expect(this.dialog.launchSubModal).toHaveBeenCalled();
            this.submodal = this.dialog.launchSubModal.mostRecentCall.args[0];
        });

        it("launches the change owner confirmation dialog", function() {
            expect(this.submodal).toBeA(chorus.alerts.InstanceChangeOwner);
        });

        it("passes the selected user to the confirmation dialog, as the model", function() {
            expect(this.submodal.model.get("id")).toBe(this.newOwner.get("id"));
            expect(this.submodal.model.displayName()).toBe(this.newOwner.displayName());
        });

        describe("confirming the new owner", function() {
            beforeEach(function() {
                expect(this.dialog.launchSubModal).toHaveBeenCalled();
                var submodal = this.dialog.launchSubModal.mostRecentCall.args[0];
                spyOn(this.instance, 'save').andCallThrough();
                submodal.trigger("confirmChangeOwner", this.newOwner);
            });

            it("sets the owner id on the instance", function() {
                expect(this.instance.get("ownerId")).toBe(this.newOwner.get("id"));
            });

            it("saves the instance", function() {
                expect(this.instance.save).toHaveBeenCalled();
            });

            describe("when the save succeeds", function() {
                beforeEach(function() {
                    spyOn(chorus, 'toast');
                    spyOn(this.dialog, 'closeModal').andCallThrough();
                    spyOnEvent(this.instance, 'invalidated');
                    this.instance.trigger("saved");
                });

                it("shows a toast message", function() {
                    expect(chorus.toast).toHaveBeenCalledWith("instances.confirm_change_owner.toast");
                });

                it("closes the dialog", function() {
                    expect(this.dialog.closeModal).toHaveBeenCalled();
                });

                it("triggers the 'invalidated' event on the instance", function() {
                    expect('invalidated').toHaveBeenTriggeredOn(this.instance);
                });
            });

            describe("when the save fails", function() {
                beforeEach(function() {
                    this.instance.serverErrors = [{ message: "shut up" }];
                    this.instance.trigger("saveFailed");
                });

                it("displays the server errors in the errors div", function() {
                    expect(this.dialog.$(".errors")).toContainText("shut up");
                });
            });
        });
    }
});
