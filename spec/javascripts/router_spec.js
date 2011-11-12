describe("chorus.Router", function() {
    beforeEach(function() {
        spyOn(chorus.router, "navigate");
    })

    describe("#logout", function() {
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
})