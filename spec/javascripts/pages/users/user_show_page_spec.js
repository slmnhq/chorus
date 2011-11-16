describe("user_show_page", function(){
    beforeEach(function(){
        this.loadTemplate("logged_in_layout");
        this.loadTemplate("header");
        this.loadTemplate("plain_text");
        this.loadTemplate("breadcrumbs");
        this.loadTemplate("user_show");
        this.loadTemplate("default_content_header");
        this.loadTemplate("main_content");
    });

    describe("#setup", function(){
        beforeEach(function(){
            this.view = new chorus.pages.UserShowPage("mark");
        });
        
        it("sets up the model with the supplied username", function(){
            expect(this.view.model.get("userName")).toBe("mark");
        });

        it("fetches the model automatically", function(){
            expect(this.server.requests[0].url).toBe("/edc/user/mark");
        });
    });

    describe("#render", function(){
        beforeEach(function(){
            fixtures.model = 'User';

            this.view = new chorus.pages.UserShowPage("johndoe");

            this.view.model.set(fixtures.jsonFor('fetch').resource[0]);
            this.view.model.loaded = true;
            this.view.render();
        });

        it("displays the first + last name in the header", function(){
            expect(this.view.$("#content_header h1").text().trim()).toBe("EDC Admin");
        });

        it("displays the word 'details' in the details-header", function(){
            expect(this.view.$("#content_details").text().trim()).toBe(t("users.details"));
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
    });
});