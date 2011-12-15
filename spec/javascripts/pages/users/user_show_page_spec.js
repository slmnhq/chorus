describe("user_show_page", function(){
    describe("#setup", function(){
        beforeEach(function(){
            this.view = new chorus.pages.UserShowPage("44");
        });

        it("sets up the model with the supplied user id", function(){
            expect(this.view.model.get("id")).toBe("44");
        });

        it("fetches the model automatically", function(){
            expect(this.server.requests[0].url).toBe("/edc/user/44");
        });
    });

    describe("#render", function(){
        beforeEach(function(){
            fixtures.model = 'User';
            this.user = fixtures.modelFor("fetch")
            this.view = new chorus.pages.UserShowPage(this.user.get("id"));
            this.view.model.set(this.user.attributes);
            this.view.model.loaded = true;
            this.view.render();
        });

        it("displays the first + last name in the header", function(){
            expect(this.view.$(".content_header h1").text().trim()).toBe("EDC Admin");
        });

        it("displays the word 'details' in the details-header", function(){
            expect(this.view.$(".content_details").text().trim()).toBe(t("users.details"));
        });

        context("breadcrumbs", function(){
            it("links to home for the first crumb", function(){
                expect(this.view.$("#breadcrumbs .breadcrumb a").eq(0).attr("href")).toBe("#/");
                expect(this.view.$("#breadcrumbs .breadcrumb a").eq(0).text()).toBe(t("breadcrumbs.home"));
            });

            it("links to /users for the second crumb", function(){
                expect(this.view.$("#breadcrumbs .breadcrumb a").eq(1).attr("href")).toBe("#/users");
                expect(this.view.$("#breadcrumbs .breadcrumb a").eq(1).text()).toBe(t("breadcrumbs.users"));
            });

            it("links to home for the first crumb", function(){
                expect(this.view.$("#breadcrumbs .breadcrumb .slug").text()).toBe(t("breadcrumbs.user_profile"));
            });
        });

        context("sidebar", function(){
            beforeEach(function(){
                setLoggedInUser({admin: true});
                this.view.model.set({id : "42"})
                this.view.render();
            });

            it("puts a UserShowSidebar in the sidebar", function(){
                expect(this.view.sidebar instanceof chorus.views.UserShowSidebar).toBeTruthy();
            })

            it("sets the sidebar's model to the user", function(){
                expect(this.view.sidebar.model).toBe(this.view.model);
            })

            context("clicking on the delete user link", function(){
                it("launches a delete user alert", function(){
                    stubModals();
                    this.view.sidebar.$("a.delete_user").click()
                    expect(chorus.modal instanceof chorus.alerts.UserDelete).toBeTruthy();
                    expect(chorus.modal.model.get("id")).toBe(42);
                });
            });

            context("clicking on the change password link", function(){
                beforeEach(function(){
                    setLoggedInUser({userName: "edcadmin"})
                    this.view.model.set({userName : "edcadmin"})
                    this.view.render();
                });

                it("launches a change password dialog", function(){
                    stubModals();
                    this.view.sidebar.$("a.change_password").click()
                    expect(chorus.modal instanceof chorus.dialogs.ChangePassword).toBeTruthy();
                })
            });
        })
    });
});
