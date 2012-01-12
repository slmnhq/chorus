describe("chorus.router", function() {
    describe("#navigate", function() {
        beforeEach(function() {
            spyOn(Backbone.history, "loadUrl");
            spyOn(Backbone.history, "navigate")
        })

        it("sets chorus.pageOptions to the third argument", function() {
            chorus.router.navigate("/foo", true, {foo: "bar"});
            expect(chorus.pageOptions).toEqual({foo: "bar"});
        });

        describe("when triggerRoute is true", function() {
            beforeEach(function() {
                Backbone.history.fragment = "/foo";
            })

            describe("and the target fragment is not the current fragment", function() {
                it("delegates to the Backbone.router implementation", function() {
                    chorus.router.navigate("/bar", true);
                    expect(Backbone.history.navigate).toHaveBeenCalledWith("/bar", true);
                })
            })

            describe("and the target fragment is the current fragment", function() {
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
            var session = this.chorus.session;
            spyOn(this.chorus.session, "fetch").andCallFake(function(options) {
                options.success(session, { status : "ok" });
            })
        })

        it("renders the page with parameters", function() {
            this.chorus.router.navigate("/workspaces/5", true);
            expect(this.chorus.page.model.get("id")).toBe("5");
        });

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
            spyOn(window, "scroll");
            this.savedAuthCookie = $.cookie("authid")
            $.cookie("authid", "1234");
        });

        afterEach(function() {
            $.cookie("authid", this.savedAuthCookie);
        })

        context("with a valid session", function() {
            beforeEach(function() {
                var session = this.chorus.session;
                spyOn(this.chorus.session, "fetch").andCallFake(function(options) {
                    options.success(session, { status : "ok" });
                })
                spyOn(this.chorus.session, "loggedIn").andReturn(true);
            })

            context("when navigating to the login page", function() {
                beforeEach(function() {
                    spyOn(chorus.pages.DashboardPage.prototype, "initialize").andCallThrough();
                    this.chorus.router.navigate("/login", true);
                })

                it("navigates to the dashboard", function() {
                    expect(chorus.pages.DashboardPage.prototype.initialize).toHaveBeenCalled();
                });
            })

            context("when navigating to any page other than login", function() {
                beforeEach(function() {
                    spyOn(chorus.pages.UserNewPage.prototype, "initialize").andCallThrough();
                    this.chorus.router.navigate("/users/new", true);
                })

                it("fetches the session", function() {
                    expect(this.chorus.session.fetch.callCount).toBe(1);
                })

                it("navigates to the requested page", function() {
                    expect(chorus.pages.UserNewPage.prototype.initialize).toHaveBeenCalled();
                })

                it("sets the scroll position to (0,0)", function() {
                    this.chorus.router.navigate("/users/new", true);
                    expect(window.scroll).toHaveBeenCalledWith(0, 0);
                })

                it("sets chorus.page.pageOptions to chorus.pageOptions", function() {
                    this.chorus.router.navigate("/users/new", true, { foo : "bar" });
                    expect(this.chorus.page.pageOptions).toEqual({ foo : "bar" })
                    expect(this.chorus.pageOptions).toBeUndefined();
                })
            })
        });

        context("with an invalid session", function() {
            beforeEach(function() {
                spyOn(chorus.pages.LoginPage.prototype, "initialize").andCallThrough();
                this.server.respondWith(
                    'GET',
                    '/edc/auth/checkLogin/?authid=1234',
                    this.prepareResponse({ status : "fail" }));
            })

            context("when navigating to the login page", function() {
                beforeEach(function() {
                    this.chorus.router.navigate("/login", true);
                    this.server.respond();
                })

                it("does the navigation", function() {
                    expect(chorus.pages.LoginPage.prototype.initialize).toHaveBeenCalled();
                });
            })

            context("when navigating to any page other than login", function() {
                beforeEach(function() {
                    this.chorus.router.navigate("/users/new", true);
                    this.server.respond();
                })

                it("navigates to the login page", function() {
                    expect(chorus.pages.LoginPage.prototype.initialize).toHaveBeenCalled();
                })
            })
        })
    })
});
