describe("chorus.views.UserSidebar", function() {
    beforeEach(function() {
        this.user = new chorus.models.User({username: "bill", id: "42"})
        this.config = new chorus.models.Config({ externalAuthEnabled: false })

        spyOn(chorus.views.UserSidebar.prototype, "setUser").andCallThrough();
        this.view = new chorus.views.UserSidebar({model: this.user, listMode: false});
        this.view.render();
    });

    it("fetches the activity stream", function() {
        expect(this.server.lastFetchFor(this.view.collection)).toBeDefined();
    });

    context("when the fetch completes", function() {
        beforeEach(function() {
            this.server.completeFetchFor(chorus.models.Config.instance());
            this.server.completeFetchFor(this.view.collection, [ rspecFixtures.activity.greenplumInstanceCreated() ]);
        });

        it("has an activity list", function() {
            expect(this.view.$(".tab_control .activity_list")).toExist();
        });

        context("when logged in as an admin", function() {
            beforeEach(function() {
                setLoggedInUser({admin: true, username: "edcadmin"});
                this.view.render();
            })

            it("should have a 'delete user' action when current user is not the same user", function() {
                expect(this.view.$(".actions a.delete_user[data-alert=UserDelete]")).toExist();
            });

            it("should not have a 'delete user' action when current user is the same user", function() {
                setLoggedInUser({admin: true, username: this.user.get("username")});
                this.view.render();

                expect(this.view.$(".actions a.delete_user[data-alert=UserDelete]")).not.toExist();
            });


            it("displays the 'change password' link", function() {
                expect(this.view.$("a.change_password[data-dialog=ChangePassword]")).toExist();
            });
        });

        context("when logged in as an non-admin", function() {
            beforeEach(function() {
                setLoggedInUser({admin: false});
                this.view.render();
            });

            context("and the user being shown is not the current user", function() {
                itShouldNotHaveActionLinks();
            });

            context("and the user being shown is the current user", function() {
                beforeEach(function() {
                    setLoggedInUser({ username: 'bill', id : "42" });
                    this.view.render();
                });

                it("has the 'edit user' link", function() {
                    expect(this.view.$("a.edit_user")).toExist();
                    expect(this.view.$("a.edit_user")).toHaveAttr("href", "#/users/42/edit")
                });

                it("has the 'delete user' link", function() {
                    expect(this.view.$("a.delete_user")).not.toExist();
                });

                it("has the 'change password' link", function() {
                    expect(this.view.$("a.change_password[data-dialog=ChangePassword]")).toExist();
                });

                context("and the 'editMode' option was passed", function() {
                    it("does not show the 'edit user' link", function() {
                        this.view.options.editMode = true;
                        this.view.render();
                        expect(this.view.$("a.edit_user")).not.toExist();
                    });
                });

                context("and external auth is configured", function() {
                    it("does not show the change password option", function() {
                        this.view.config.set({ externalAuthEnabled: true })
                        this.view.render();
                        expect(this.view.$("a.change_password")).not.toExist();
                    });
                })
            });
        });

        describe("listMode", function() {
            beforeEach(function() {
                setLoggedInUser({admin: true});
                this.view.options.listMode = true;
                this.view.render();
            });

            itShouldNotHaveActionLinks();
        });

        describe("#setUser(user)", function() {
            beforeEach(function() {
                this.user2 = rspecFixtures.user({ title: "Lame Test-Driver" })
                this.view.setUser(this.user2);
            });

            it("shows the new user's name and title'", function() {
                expect(this.view.$(".full_name")).toHaveText(this.user2.displayName());
                expect(this.view.$(".title")).toHaveText(this.user2.get("title"));
            });

            it("fetches the other user's activities'", function() {
                expect(this.user2.activities()).toHaveBeenFetched();
            });

            it("is called when user:selected is triggered", function() {
                this.view.setUser.reset();
                chorus.PageEvents.broadcast("user:selected", rspecFixtures.user());
                expect(this.view.setUser).toHaveBeenCalled();
            });
        });
    });

    context("without a user", function() {
        beforeEach(function() {
            this.view = new chorus.views.UserSidebar({listMode: false});
            this.server.completeFetchFor(chorus.models.Config.instance());
            this.view.render();
        });

        it("should render something", function() {
            expect(this.view.$(".info")).toExist();
        });
    });

    function itShouldNotHaveActionLinks() {
        it("should not render the action links", function() {
            expect(this.view.$(".actions .edit_user")).not.toExist();
            expect(this.view.$(".actions .delete_user")).not.toExist();
            expect(this.view.$(".actions .change_password")).not.toExist();
        });
    }
});
