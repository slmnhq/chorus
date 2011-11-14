describe("chorus.router", function() {
    describe("#logout", function() {
        beforeEach(function() {
            spyOn(chorus.router, "navigate");
        })

        describe("when there is no chorus.user", function() {
            beforeEach(function() {
                chorus.user = undefined;
                chorus.router.logout();
            })

            it("navigates to /login", function() {
                expect(chorus.router.navigate).toHaveBeenCalledWith("/login", true);
            })
        })

        describe("when there is a chorus.user, but it has errors", function() {
            beforeEach(function() {
                chorus.user = new chorus.models.User({ errors: ["whatever"] });
                chorus.router.logout();
            })

            it("navigates to /login", function() {
                expect(chorus.router.navigate).toHaveBeenCalledWith("/login", true);
            })
        })

        describe("when there is a chorus.user without errors", function(){
            beforeEach(function(){
                $.cookie("authid", "1234");
                chorus.user = new chorus.models.User();
                chorus.router.logout();
            });

            afterEach(function(){
                $.cookie("authid", null);
            });

            it("calls the logout API", function(){
                expect(this.server.requests[0].url).toBe("/edc/auth/logout/?authid=1234");
            });

            describe("and the server responds", function() {
                beforeEach(function() {
                    this.server.respondWith(
                        'GET',
                        '/edc/auth/logout/?authid=1234',
                        this.prepareResponse('{"message":[],"status":"ok","requestId":2694,"resource":[],"method":"GET","resourcelink":"/edc/auth/logout/","pagination":null,"version":"0.1"}'));

                    this.server.respond();
                })

                it("navigates to /login", function() {
                    expect(chorus.router.navigate).toHaveBeenCalledWith("/login", true);
                })
            })

        });
    })

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
            })
        })
    })
})