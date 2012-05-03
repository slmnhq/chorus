describe("chorus.pages.UserShow", function(){
    describe("#setup", function(){
        beforeEach(function(){
            this.view = new chorus.pages.UserShowPage("44");
        });

        it("sets up the model with the supplied user id", function(){
            expect(this.view.model.get("id")).toBe("44");
        });

        it("fetches the model automatically", function(){
            expect(this.server.requests[0].url).toBe("/users/44");
        });

        it("has a helpId", function() {
            expect(this.view.helpId).toBe("user")
        })

        context("when the model fails to load properly", function() {
            beforeEach(function() {
                spyOn(Backbone.history, "loadUrl")
                this.view.model.trigger('fetchNotFound')
            })

            it("navigates to the 404 page", function() {
                expect(Backbone.history.loadUrl).toHaveBeenCalledWith("/invalidRoute")
            })
        })
    });

    describe("#render", function(){
        beforeEach(function(){
            this.user = newFixtures.user({username: "edcadmin", id: "42", first_name: "EDC", last_name: "Admin"});
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

            it("displays the user name for the last crumb", function(){
                expect(this.view.$("#breadcrumbs .breadcrumb .slug").text()).toBe("EDC Admin");
            });
        });

        context("sidebar", function(){
            beforeEach(function(){
                setLoggedInUser({admin: true});
                this.view.model.set({id : "42"})
                this.view.render();
            });

            it("puts a UserSidebar in the sidebar", function(){
                expect(this.view.sidebar instanceof chorus.views.UserSidebar).toBeTruthy();
            })

            it("sets the sidebar's model to the user", function(){
                expect(this.view.sidebar.model).toBe(this.view.model);
            })
        })
    });
});
