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

            spyOn(this.chorus.session, 'loggedIn').andReturn(true);
        })

        it("renders the page with parameters", function() {
            this.chorus.router.navigate("/workspaces/5", true);
            expect(this.chorus.page.model.get("id")).toBe("5");
        });

        it("triggers a route event on the router", function() {
            spyOnEvent(this.chorus.router, 'route');
            this.chorus.router.navigate("/", true);
            expect('route').toHaveBeenTriggeredOn(this.chorus.router);
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
            spyOn(window, "scroll");
        });

        context("when logged in", function() {
            beforeEach(function() {
                spyOn(this.chorus.session, 'loggedIn').andReturn(true);
            });

            it("sets the scroll position to (0,0)", function() {
                this.chorus.router.navigate("/users/new", true);
                expect(window.scroll).toHaveBeenCalledWith(0, 0);
            })

            context("and navigating to any page other than the login page", function() {
                beforeEach(function () {
                    this.chorus.router.navigate("/users/new", true);
                })

                it("does not check login", function() {
                    expect(this.chorus.session.fetch.callCount).toBe(1);
                });
            });

            context("and attempting to navigate to the login page", function() {
                beforeEach(function () {
                    this.routeSpy = jasmine.createSpy("routeSpy");
                    this.chorus.router.bind("route", this.routeSpy);
                    this.chorus.router.navigate("/login", true);
                })

                it("redirects to the dashboard", function() {
                    expect(this.routeSpy).toHaveBeenCalledWith("Dashboard", {})
                })
            })
        });

        context("when not logged in", function() {
            beforeEach(function() {
                spyOnEvent(this.chorus.router, "route");
                spyOn(this.chorus.session, 'loggedIn').andReturn(false);
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
                expect("route").not.toHaveBeenTriggeredOn(this.chorus.router);
                this.chorus.session.fetch.mostRecentCall.args[0].success();
                expect("route").toHaveBeenTriggeredOn(this.chorus.router);
            });
        });
    });
})
