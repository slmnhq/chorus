describe("chorus.router", function() {
    describe("#navigate", function() {
        describe("when triggerRoute is true", function() {
            describe("and the target fragment is not the current fragment", function() {
                beforeEach(function() {
                    spyOn(Backbone.history, "navigate");
                    Backbone.history.fragment = "/foo";
                })

                it("delegates to the Backbone.router implementation", function() {
                    chorus.router.navigate("/bar", true);
                    expect(Backbone.history.navigate).toHaveBeenCalledWith("/bar", true);
                })
            })

            describe("and the target fragment is the current fragment", function() {
                beforeEach(function() {
                    spyOn(Backbone.history, "loadUrl");
                    spyOn(Backbone.history, "navigate")
                    Backbone.history.fragment = "/foo";
                })

                it("calls loadUrl on the fragment", function() {
                    chorus.router.navigate("/foo", true);
                    expect(Backbone.history.loadUrl).toHaveBeenCalledWith("/foo");
                    expect(Backbone.history.navigate).not.toHaveBeenCalled();
                })

                it("calls loadUrl on the fragment, even if the target fragment is prefixed by #", function() {
                    chorus.router.navigate("#/foo", true);
                    expect(Backbone.history.loadUrl).toHaveBeenCalledWith("/foo");
                    expect(Backbone.history.navigate).not.toHaveBeenCalled();
                })
            })
        })
    });

    describe(".initialize", function() {
        beforeEach(function() {
            this.chorus = new Chorus();
            this.backboneSpy = spyOn(Backbone.history, "start")
            this.chorus.initialize();

            this.chorus.router.showDevLinks = false


            this.loadTemplate("header");
            this.loadTemplate("breadcrumbs");
            this.loadTemplate("main_content");
            this.loadTemplate("default_content_header");
            this.loadTemplate("routes");
            this.loadTemplate("user_list");
            this.loadTemplate("dashboard_sidebar");
            this.loadTemplate("logged_in_layout");
            this.loadTemplate("plain_text")
            this.loadTemplate("truncated_text")

            this.savedLocation = window.location.hash;
        })

        afterEach(function() {
            window.location.hash = this.savedLocation;
        })

        it("renders the page with parameters", function() {
            this.loadTemplate("workspace_detail");
            this.loadTemplate("sub_nav_content");
            this.loadTemplate("sub_nav");
            this.loadTemplate("workspace_summary_sidebar");
            this.chorus.router.navigate("/workspaces/5", true);
            expect(this.chorus.page.model.get("id")).toBe("5");
        });

        it("triggers a route event on the router", function() {
            var routeSpy = jasmine.createSpy("routeSpy");
            this.chorus.router.bind("route", routeSpy);
            this.chorus.router.navigate("/", true);
            expect(routeSpy).toHaveBeenCalled();
        })
    })
})
