describe("chorus.pages.UserEditPage", function() {
    beforeEach(function() {
        this.loadTemplate("user_new");
        this.loadTemplate("breadcrumbs");
        this.loadTemplate("header");
        this.loadTemplate("main_content")
        this.loadTemplate("default_content_header")
        this.loadTemplate("plain_text")
        this.loadTemplate("validating");
        this.loadTemplate("logged_in_layout");
        this.loadTemplate("user_edit")
        this.loadTemplate("user_show_sidebar")
        this.page = new chorus.pages.UserNewPage()
    });

    describe("#setup", function() {
        beforeEach(function() {
            this.view = new chorus.pages.UserEditPage("42");
        });

        it("sets up the model with the supplied user id", function() {
            expect(this.view.model.get("id")).toBe("42");
        });

        it("fetches the model automatically", function() {
            expect(this.server.requests[0].url).toBe("/edc/user/42");
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            fixtures.model = 'User';
            chorus.session = new chorus.models.Session();
            setLoggedInUser({"userName" : "edcadmin"});
            this.view = new chorus.pages.UserEditPage("johndoe");

            this.view.model.set(fixtures.jsonFor('fetch').resource[0]);
            this.view.model.loaded = true;
            this.view.render();
        });

        it("displays the first + last name in the header", function() {
            expect(this.view.$("#content_header h1").text().trim()).toBe("EDC Admin");
        });

        it("displays the word 'details' in the details-header", function() {
            expect(this.view.$("#content_details").text().trim()).toBe(t("users.details"));
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
                expect(this.view.$("#breadcrumbs .breadcrumb a").eq(2).attr("href")).toBe("#/users/" + this.view.model.get("userName"));
                expect(this.view.$("#breadcrumbs .breadcrumb a").eq(2).text()).toBe(t("breadcrumbs.user_profile"));
            });

            it("displays edit user for the fourth crumb", function() {
                expect(this.view.$("#breadcrumbs .breadcrumb .slug").text()).toBe(t("breadcrumbs.user_edit"));
            })
        });

    })
})
