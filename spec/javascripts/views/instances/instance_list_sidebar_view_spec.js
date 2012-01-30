describe("chorus.views.InstanceListSidebar", function() {
    beforeEach(function() {
    });

    context("when no instance is selected", function() {
        beforeEach(function() {
            this.view = new chorus.views.InstanceListSidebar();
            this.view.render();
        });

        describe("render", function() {
            it("should not display instance information", function() {
                expect(this.view.$(".info")).not.toExist();
            });
        });
    });

    context("when an instance is selected", function() {
        beforeEach(function() {
            this.instance = fixtures.instance({instanceProvider: "Greenplum", name : "Harry's House of Glamour"})
            spyOn(this.instance, 'fetch').andCallThrough();
            spyOn(this.instance.accounts(), 'fetch').andCallThrough();
            spyOn(this.instance.usage(), 'fetch').andCallThrough();
            spyOn(this.instance.activities(), 'fetch').andCallThrough();
            this.activityViewStub = stubView("OMG I'm the activity list")
            spyOn(chorus.views, 'ActivityList').andReturn(this.activityViewStub)

            spyOn(chorus.views.Base.prototype, "render").andCallThrough();
            this.view = new chorus.views.InstanceListSidebar();
            this.view.trigger("instance:selected", this.instance);
            $('#jasmine_content').append(this.view.el);
        });

        it("fetches the activities", function() {
            expect(this.instance.activities().fetch).toHaveBeenCalled();
        });

        it("fetches instance usage and adds it to the required resources", function() {
            expect(this.instance.usage().fetch).toHaveBeenCalled();
            expect(this.view.requiredResources).toContain(this.instance.usage());
        });

        it("fetches the accounts for the instance and adds them to the required resources", function() {
            expect(this.instance.accounts().fetch).toHaveBeenCalled();
        });

        it("fetches the details for the instance", function() {
            expect(this.instance.fetch).toHaveBeenCalled();
        });

        context("when the data has been loaded", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.instance.activities());
                this.server.completeFetchFor(this.instance.accounts());
                this.server.completeFetchFor(this.instance.usage(), fixtures.instanceUsage());
                this.server.completeFetchFor(this.instance.accountForCurrentUser());
                this.server.completeFetchFor(this.instance);
            });

            it("displays instance name", function() {
                expect(this.view.$(".instance_name").text()).toBe("Harry's House of Glamour");
            });

            it("displays instance type", function() {
                expect(this.view.$(".instance_type").text()).toBe("Greenplum");
            });

            it("renders ActivityList subview", function() {
                expect(this.view.$(".activity_list")).toBeVisible();
                expect(this.view.$(".activity_list").text()).toBe("OMG I'm the activity list")
            });

            it("populates the ActivityList with the activities", function() {
                expect(chorus.views.ActivityList.mostRecentCall.args[0].collection).toBe(this.instance.activities());
            });

            it("sets the ActivityList displayStyle to without_object", function() {
                expect(chorus.views.ActivityList.mostRecentCall.args[0].displayStyle).toBe('without_object');
            });

            it("has a 'add a note' link", function() {
                expect(this.view.$("a[data-dialog=NotesNew]")).toExist();
                expect(this.view.$("a[data-dialog=NotesNew]").text()).toMatchTranslation("actions.add_note");
                expect(this.view.$("a[data-dialog=NotesNew]").data("workfileAttachments")).toBeFalsy();
            });

            context("when user is an admin or owner of the instance", function() {
                it("displays edit instance link when user is admin", function() {
                    setLoggedInUser({ userName : "benjamin", admin: true});
                    this.view.render();
                    expect(this.view.$(".actions .edit_instance")).toExist();
                });

                it("displays edit instance link when user is owner", function() {
                    setLoggedInUser({ userName : "benjamin", admin: false});
                    this.instance.set({ownerId : chorus.session.user().get('id')});
                    this.view.render();
                    expect(this.view.$(".actions .edit_instance")).toExist();
                });

                it("does not display the delete instance link", function() {
                    expect(this.view.$(".actions .delete_instance")).not.toExist();
                });

                context("when the instance failed to provision", function() {
                    beforeEach(function() {
                        setLoggedInUser({ userName : "benjamin", admin: true});
                        this.instance.set({
                            state: "fault",
                            provisionType: "create"
                        });
                        this.view.render();
                    });

                    it("sets the deleteable flag on the context", function() {
                        expect(this.view.additionalContext().deleteable).toBeTruthy();
                    });

                    it("displays the delete instance link", function() {
                        expect(this.view.$(".actions .delete_instance")).toExist();
                    });
                });
            });

            context("when user is not an admin or owner of the instance", function() {
                beforeEach(function() {
                    setLoggedInUser({ userName : "benjamin", admin: false});
                    this.instance.set({owner : "harry"});
                    this.view.render();
                });

                it("does not display edit instance link when user is neither admin nor owner", function() {
                    expect(this.view.$(".actions .edit_instance")).not.toExist();
                });

                it("does not display the delete instance link", function() {
                    expect(this.view.$(".actions .delete_instance")).not.toExist();
                });

            });

            context("when the fetched accounts triggers a 'reset' event", function() {
                beforeEach(function() {
                    this.view.render.reset();
                    this.instance.accounts().trigger('reset');
                });

                it("re-renders", function() {
                    expect(this.view.render).toHaveBeenCalled();
                })
            });

            context("when configuration is clicked", function() {
                beforeEach(function() {
                    expect(this.view.$(".configuration_detail")).not.toBeVisible();
                    this.view.$(".tab_control li.configuration").click();
                })

                it("shows configuration", function() {
                    expect(this.view.$(".configuration_detail")).not.toHaveClass("hidden")
                    expect(this.view.$(".activity_list")).toHaveClass("hidden")
                })

                describe("for existing greenplum instance", function() {
                    beforeEach(function() {
                        this.view.render();
                    });

                    context("and the instance has a shared account", function() {
                        beforeEach(function() {
                            this.view.model = fixtures.instanceWithSharedAccount();
                            this.view.render();
                        });

                        it("includes the shared account information", function() {
                            expect(this.view.$(".configuration_detail").text().indexOf(t("instances.shared_account"))).not.toBe(-1);
                        });
                    });

                    context("and the instance does not have a shared account", function() {
                        it("does not include the shared account information", function() {
                            expect(this.view.$(".configuration_detail").text().indexOf(t("instances.sidebar.shared_account"))).toBe(-1);
                        });
                    });
                });

                describe("for a new greenplum instance", function() {
                    beforeEach(function() {
                        this.view.model = this.view.model.set({ size: "1", port: null, host: null, sharedAccount: {} });
                        this.view.render();
                    });

                    it("includes greenplum db size information", function() {
                        expect(this.view.$(".configuration_detail").text().indexOf(t("instances.sidebar.size"))).not.toBe(-1);
                    });

                    it("does not include the port, host, or shared account information", function() {
                        expect(this.view.$(".configuration_detail").text().indexOf(t("instances.sidebar.host"))).toBe(-1);
                        expect(this.view.$(".configuration_detail").text().indexOf(t("instances.sidebar.port"))).toBe(-1);
                        expect(this.view.$(".configuration_detail").text().indexOf(t("instances.sidebar.shared_account"))).toBe(-1);
                    });
                });
            })

            context("when the instance has a shared account", function() {
                beforeEach(function() {
                    this.instance.set({
                        sharedAccount: { dbUserName: "polenta" }
                    });
                    this.view.render();
                });

                it("does not show the 'edit credentials' link", function() {
                    expect(this.view.$(".actions .edit_credentials")).not.toExist();
                });

                it("does not show the 'add credentials' link", function() {
                    expect(this.view.$(".actions .add_credentials")).not.toExist();
                });

                it("displays edit instance link when user is admin", function() {
                    setLoggedInUser({ userName : "benjamin", admin: true});
                    this.view.render();
                    expect(this.view.$(".actions .edit_instance")).toExist();
                });

                it("displays edit instance link when user is owner", function() {
                    setLoggedInUser({ userName : "benjamin", admin: false});
                    this.instance.set({ownerId : chorus.session.user().get('id')});
                    this.view.render();
                    expect(this.view.$(".actions .edit_instance")).toExist();
                });

                it("does NOT display the edit instance link when user is not an admin or owner", function() {
                    setLoggedInUser({ userName : "benjamin", admin: false});
                    this.view.render();
                    expect(this.view.$(".actions .edit_instance")).not.toExist();
                });
            });

            context("when the instance does not have a shared account", function() {
                context("when the current user is NOT an admin or owner of the instance", function() {
                    context("when the user does not have an account for the instance", function() {
                        it("shows the 'no access' text and image", function() {
                            expect(this.view.$(".account_info img").attr("src")).toBe("/images/instances/no_access.png");
                            expect(this.view.$(".account_info").text().trim()).toMatchTranslation("instances.sidebar.no_access");
                        });

                        it("shows the add credentials link", function() {
                            expect(this.view.$(".actions .add_credentials")).toExist();
                            expect(this.view.$(".actions .add_credentials").data("dialog")).toBe("InstanceAccount");
                            expect(this.view.$(".actions .add_credentials").data("title")).toMatchTranslation("instances.account.add.title");
                            expect(this.view.$(".actions .add_credentials").text()).toMatchTranslation("instances.sidebar.add_credentials");
                        });

                        it("does not show the 'edit credentials' link", function() {
                            expect(this.view.$(".actions .edit_credentials")).not.toExist();
                        });

                        it("does not show the 'remove credentials' link", function() {
                            expect(this.view.$(".actions .remove_credentials")).not.toExist();
                        });
                    });

                    context("when the user has set up an account for the instance", function() {
                        beforeEach(function() {
                            var account = fixtures.instanceAccount();
                            spyOn(this.instance, 'accountForCurrentUser').andReturn(account);
                            this.view.render();
                        });

                        it("shows the 'access' text and image", function() {
                            expect(this.view.$(".account_info img").attr("src")).toBe("/images/instances/access.png");
                            expect(this.view.$(".account_info").text().trim()).toMatchTranslation("instances.sidebar.access");
                        });

                        it("shows the 'remove credentials' link", function() {
                            expect(this.view.$(".actions .remove_credentials").text()).toMatchTranslation("instances.sidebar.remove_credentials");
                            expect(this.view.$(".actions .remove_credentials").data("alert")).toBe("InstanceAccountDelete");
                        });

                        it("shows the 'edit credentials' link", function() {
                            expect(this.view.$(".actions .edit_credentials")).toExist();
                            expect(this.view.$(".actions .edit_credentials").data("dialog")).toBe("InstanceAccount");
                            expect(this.view.$(".actions .edit_credentials").data("title")).toMatchTranslation("instances.account.edit.title");
                            expect(this.view.$(".actions .edit_credentials").text()).toMatchTranslation("instances.sidebar.edit_credentials");
                        });

                        it("does not show the 'add credentials' link", function() {
                            expect(this.view.$(".actions .add_credentials")).not.toExist();
                        });

                        describe("when the user removes their credentials", function() {
                            beforeEach(function() {
                                this.instance.accountForCurrentUser = this.instance.accountForCurrentUser.originalValue;
                                this.instance.accountForCurrentUser().trigger("destroy");
                            });

                            it("shows the add credentials link", function() {
                                expect(this.view.$(".actions .add_credentials")).toExist();
                                expect(this.view.$(".actions .add_credentials").data("dialog")).toBe("InstanceAccount");
                                expect(this.view.$(".actions .add_credentials").data("title")).toMatchTranslation("instances.account.add.title");
                                expect(this.view.$(".actions .add_credentials").text()).toMatchTranslation("instances.sidebar.add_credentials");
                            });
                        });
                    });
                });

                context("when the current user is an admin", function() {
                    beforeEach(function() {
                        var account = fixtures.instanceAccount();
                        spyOn(this.instance, 'accountForCurrentUser').andReturn(account);
                        this.instance.accounts().add([fixtures.instanceAccount(), fixtures.instanceAccount()]);
                        setLoggedInUser({ userName : "benjamin", admin: true});
                        this.view.render();
                    });

                    it("does not show the individual_account area", function() {
                        expect(this.view.$('.individual_account')).not.toBeVisible();
                    });

                    it("does not show the add/edit/remove credentials links", function() {
                        expect(this.view.$(".actions .remove_credentials")).not.toBeVisible();
                        expect(this.view.$(".actions .edit_credentials")).not.toBeVisible();
                        expect(this.view.$(".actions .add_credentials")).not.toBeVisible();
                    });

                    it("shows the edit_individual_accounts area", function() {
                        expect(this.view.$(".edit_individual_accounts")).toBeVisible();
                        expect(this.view.$(".edit_individual_accounts a[data-dialog=InstancePermissions]")).toBeVisible();
                        expect(this.view.$(".individual_accounts_count").text()).toMatchTranslation('instances.sidebar.there_are_x_individual_accounts', {count: 2});
                    });
                });
            });

            describe("workspace usage", function() {
                context("when there are no workspaces", function() {
                    beforeEach(function() {
                        this.instance.usage().set({workspaces: []});
                        this.view.render();
                    });

                    it("should not be a dialog link", function() {
                        expect(this.view.$('.actions .workspace_usage')).toHaveClass('disabled');
                        expect(this.view.$('.actions .workspace_usage').data('dialog')).toBeUndefined();
                    });
                })

                context("when there are workspaces", function() {
                    beforeEach(function() {
                        this.instance.usage().set({workspaces: [fixtures.instanceWorkspaceUsageJson(), fixtures.instanceWorkspaceUsageJson()]});
                    });

                    it("should be a dialog link", function() {
                        expect(this.view.$('.actions .workspace_usage').data('dialog')).not.toBeUndefined();
                    })

                    it("should show the appropriate number of workspaces", function() {
                        expect(this.view.$('.actions .workspace_usage')).toContainTranslation('instances.sidebar.usage', {count: 2});
                    });
                })
            })

        });
    });
});
