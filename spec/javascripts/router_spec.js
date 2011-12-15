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


            this.loadTemplate("dashboard");
            this.loadTemplate("header");
            this.loadTemplate("breadcrumbs");
            this.loadTemplate("main_content");
            this.loadTemplate("default_content_header");
            this.loadTemplate("user_list");
            this.loadTemplate("dashboard_sidebar");
            this.loadTemplate("logged_in_layout");
            this.loadTemplate("plain_text")
            this.loadTemplate("truncated_text")
            this.loadTemplate("dashboard_workspace_list");
            this.loadTemplate("dashboard_workspace_list_footer");
            this.loadTemplate("sidebar_activity_list");
            this.loadTemplate("main_activity_list");

            spyOn(this.chorus.session, 'loggedIn').andReturn(true);

            this.savedLocation = window.location.hash;
        })

        afterEach(function() {
            window.location.hash = this.savedLocation;
        })

        it("renders the page with parameters", function() {
            this.loadTemplate("workspace_detail");
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

        it("closes the current modal", function() {
            this.chorus.modal = new chorus.dialogs.ChangePassword();
            spyOn(this.chorus.modal, "closeModal");
            this.chorus.router.navigate("/", true);
            expect(this.chorus.modal.closeModal).toHaveBeenCalled();
        });
    });

    describe("generateRouteCallback", function() {
        beforeEach(function() {
            this.chorus = new Chorus();
            this.backboneSpy = spyOn(Backbone.history, "start")
            this.chorus.initialize();
            spyOn(this.chorus.session, 'fetch');
        });

        context("when logged in", function() {
            beforeEach(function() {
                spyOn(this.chorus.session, 'loggedIn').andReturn(true);
            });

            it("does not check login", function() {
                expect(this.chorus.session.fetch).not.toHaveBeenCalled();
            });
        });

        context("when not logged in", function() {
            beforeEach(function() {
                spyOn(this.chorus.session, 'loggedIn').andReturn(false);
                this.routeSpy = jasmine.createSpy("route");
                this.loadTemplate("breadcrumbs");
                this.loadTemplate("default_content_header");
                this.loadTemplate("header");
                this.loadTemplate("login");
                this.loadTemplate("logged_in_layout");
                this.loadTemplate("plain_text");
                this.loadTemplate("main_content");
                this.loadTemplate("user_new");
                this.chorus.router.bind("route", this.routeSpy);
            });

            it("checks login", function() {
                this.chorus.router.navigate("/users/new", true);
                expect(this.chorus.session.fetch).toHaveBeenCalled();
            });

            it("does not fetch the user if navigating to the Login page", function() {
                this.chorus.router.navigate("/login", true);
                expect(this.chorus.session.fetch).not.toHaveBeenCalled();
            });

            it("calls trigger after the user has been fetched", function() {
                this.chorus.router.navigate("/users/new", true);
                expect(this.chorus.session.fetch).toHaveBeenCalled();
                expect(this.routeSpy).not.toHaveBeenCalled();
                this.chorus.session.fetch.mostRecentCall.args[0].success();
                expect(this.routeSpy).toHaveBeenCalled();
            });
        });
    });
})
