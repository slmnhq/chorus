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

    describe("#render", function() {
        context("when logged in as an admin", function() {
            beforeEach(function() {
                setLoggedInUser({admin: true});
                this.view = new chorus.views.UserShowSidebar({model: this.user});
                this.view.render();
            })

            it("should have a 'delete user' action", function() {
                expect(this.view.$(".actions a.delete_user[data-alert=UserDelete]")).toExist();
            });
        })
    })

    context("when logged in as an non-admin", function() {
        beforeEach(function() {
            setLoggedInUser({admin: false});
            this.view = new chorus.views.UserShowSidebar({model: this.user});
        });

        context("user being shown is not user logged in", function() {
            beforeEach(function() {
                this.view.render();
            });
            it("shouldn't have actions", function() {
                expect(this.view.$(".actions")).not.toExist();
            });
        });
        context("user being shown is user logged in", function() {
            beforeEach(function() {
                setLoggedInUser({'userName': 'bill', 'id' : "42"});
                this.view.render();
            });

            it("should have the edit user action", function() {
                expect(this.view.$("a.edit_user")).toExist();
                expect(this.view.$("a.edit_user")).toHaveAttr("href", "#/users/42/edit")
            });

            it("should not allow delete user", function() {
                expect(this.view.$("a.delete_user")).not.toExist();
            });
        })
    });

    context("user being shown is user logged in", function() {
        beforeEach(function() {
            setLoggedInUser({userName: "inspectorHenderson"});
            this.view = new chorus.views.UserShowSidebar({model: this.user});
            this.view.model.set({userName : "inspectorHenderson"});

        });

        it("should allow change password", function() {
            expect(this.view.$("a.change_password[data-dialog=ChangePassword]")).toExist();
        });
    })

    context("user being shown is not the user logged in", function() {
        beforeEach(function() {
            setLoggedInUser({userName: "inspectorHenderson"});

            this.view = new chorus.views.UserShowSidebar({model: this.user});
            this.view.model.set({userName : "edcadmin"});
        });

        it("should not show change password option", function() {
            expect(this.view.$("a.change_password")).not.toExist();
        });
    })

    context("system is in external authentication mode", function() {
        beforeEach(function() {
            this.config.set({ externalAuth: true })
            setLoggedInUser({userName: "inspectorHenderson"});
            this.view = new chorus.views.UserShowSidebar({model: this.user});
            this.view.model.set({userName : "inspectorHenderson"});
        });

        it("does not show the change password option", function() {
            expect(this.view.$("a.change_password")).not.toExist();
        })
    })
});
