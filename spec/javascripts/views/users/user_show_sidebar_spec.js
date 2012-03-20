describe("chorus.views.UserShowSidebar", function() {
    beforeEach(function() {
        this.user = new chorus.models.User({userName: "bill", id: "42"})
        this.config = new chorus.models.Config({ externalAuth: false })
        this.config.loaded = true;
        spyOn(chorus.models.Config, "instance").andReturn(this.config);
    });

    describe("activityList", function() {
        beforeEach(function() {
            this.view = new chorus.views.UserShowSidebar({model: this.user});
            this.view.render();
        });
        it("has sideBarActivityListView", function() {
            expect(this.view.activityList).toBeDefined();
        });

        it("fetches the activitySet for users", function() {
            expect(this.server.requests[0].url).toBe("/edc/activitystream/user/42?page=1&rows=50");
            expect(this.server.requests[0].method).toBe("GET");
        });

        describe("when the model is changed", function() {
            beforeEach(function() {
                spyOn(this.view.activityList, "render").andCallThrough();
                this.view.model.trigger("change")
            });

            it("re-renders the activity list", function() {
                expect(this.view.activityList.render).toHaveBeenCalled();
            });
        });

        describe("when the activity list collection is changed", function() {
            beforeEach(function() {
                spyOn(this.view, "postRender"); // check for #postRender because #render is bound
                this.view.collection.trigger("changed")
            })

            it("re-renders", function() {
                expect(this.view.postRender).toHaveBeenCalled();
            })
        });
    });

    context("when logged in as an admin", function() {
        beforeEach(function() {
            setLoggedInUser({admin: true});
            this.view = new chorus.views.UserShowSidebar({model: this.user});
            this.view.render();
        })

        it("should have a 'delete user' action", function() {
            expect(this.view.$(".actions a.delete_user[data-alert=UserDelete]")).toExist();
        });
    });

    context("when logged in as an non-admin", function() {
        beforeEach(function() {
            setLoggedInUser({admin: false});
            this.view = new chorus.views.UserShowSidebar({model: this.user});
        });

        context("and the user being shown is not the current user", function() {
            it("shouldn't have actions", function() {
                this.view.render();
                expect(this.view.$(".actions")).not.toExist();
            });

            it("should not show change password option", function() {
                expect(this.view.$("a.change_password")).not.toExist();
            });
        });

        context("and the user being shown is the current user", function() {
            beforeEach(function() {
                setLoggedInUser({ userName: 'bill', id : "42" });
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
                    this.config.set({ externalAuth: true })
                    this.view.render();
                    expect(this.view.$("a.change_password")).not.toExist();
                });
            })
        });
    });
});
