describe("chorus.pages.UserEditPage", function() {
    describe("#setup", function() {
        beforeEach(function() {
            this.view = new chorus.pages.UserEditPage("42");
        });

        it("fetches the right user", function() {
            expect(this.view.model).toBeA(chorus.models.User);
            expect(this.view.model.get("id")).toBe("42");
            expect(this.view.model).toHaveBeenFetched();
        });

        it("has a helpId", function() {
            expect(this.view.helpId).toBe("user_edit")
        })
    });

    describe("#render", function() {
        beforeEach(function() {
            this.user = newFixtures.user()
            setLoggedInUser(this.user.attributes);

            this.view = new chorus.pages.UserEditPage(this.user.get("id"));

            this.server.completeFetchFor(this.user);
            this.server.completeFetchFor(this.user.activities());
            this.server.completeFetchFor(chorus.models.Config.instance());
        });

        it("displays the first + last name in the header", function() {
            expect(this.view.$(".content_header h1").text().trim()).toBe(this.user.displayName());
        });

        it("displays the word 'details' in the details-header", function() {
            expect(this.view.$(".content_details").text().trim()).toBe(t("users.details"));
        });

        it("does not have the 'edit profile' link in the sidebar", function() {
            expect(this.view.$("a.edit_user")).not.toExist();
        });

        context("breadcrumbs", function() {
            it("links to home for the first crumb", function() {
                expect(this.view.$("#breadcrumbs .breadcrumb a").eq(0).attr("href")).toBe("#/");
                expect(this.view.$("#breadcrumbs .breadcrumb a").eq(0).text()).toBe(t("breadcrumbs.home"));
            });

            it("links to /users for the second crumb", function() {
                expect(this.view.$("#breadcrumbs .breadcrumb a").eq(1).attr("href")).toBe("#/users");
                expect(this.view.$("#breadcrumbs .breadcrumb a").eq(1).text()).toBe(t("breadcrumbs.users"));
            });

            it("links to user show for the third crumb", function() {
                expect(this.view.$("#breadcrumbs .breadcrumb a").eq(2).attr("href")).toBe(this.view.model.showUrl());
                expect(this.view.$("#breadcrumbs .breadcrumb a").eq(2).text()).toBe(t("breadcrumbs.user_profile"));
            });

            it("displays edit user for the fourth crumb", function() {
                expect(this.view.$("#breadcrumbs .breadcrumb .slug").text()).toBe(t("breadcrumbs.user_edit"));
            });
        });
    });
});
