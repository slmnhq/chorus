describe("chorus.views.UserShowSidebar", function() {
    beforeEach(function() {
        this.loadTemplate("user_show_sidebar");

        this.user = new chorus.models.User({userName: "bill", id: "42"})
    });

    describe("#render", function() {
        context("when logged in as an admin", function() {
            beforeEach(function() {
                setLoggedInUser({admin: true});
                this.view = new chorus.views.UserShowSidebar({model: this.user});
                this.view.render();
            })

            it("should have actions", function() {
                expect(this.view.$(".actions")).toExist();
            });

            context("clicking the delete User link", function() {
                beforeEach(function() {
                    this.view.$("a.delete_user").click()
                })

                it("launches a delete user alert", function() {
                    expect(chorus.modal instanceof chorus.alerts.UserDelete).toBeTruthy();
                })
            })
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

    })
});
