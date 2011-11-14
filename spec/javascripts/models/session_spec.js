describe("chorus.models.Session", function() {


    var models = chorus.models;
    beforeEach(function() {
        fixtures.model = 'Session';
    });

    describe("#save", function() {
        beforeEach(function() {
            this.model = new models.Session({ userName : "johnjohn", password : "partytime"});
            this.model.save();
        });

        it("has the right url", function() {
            expect(this.server.requests[0].url).toBe("/edc/auth/login/");
        });

        it("has the right method", function() {
            expect(this.server.requests[0].method).toBe("POST");
        });

    });

    describe("saved", function() {
        beforeEach(function() {
            $.cookie("userName", null)
            this.model = new models.Session({ userName : "ponyParty", password : "partytime"});
            this.model.trigger("saved");
        });
        it("sets the authUser cookie", function() {
            expect($.cookie("userName")).toBe("ponyParty")
        })

    }),

    describe("#logout", function() {
        beforeEach(function(){
            this.model = new models.Session();
            this.needsLoginSpy = jasmine.createSpy();
            this.model.bind("needsLogin", this.needsLoginSpy);


        })

        describe("when there is no chorus.user", function() {
            beforeEach(function() {
                spyOn(chorus.router, "navigate")
                this.model.logout();
            })

            it("navigates to /login", function() {
                expect(this.needsLoginSpy).toHaveBeenCalled();
            })
        })

        describe("when there is a chorus.user, but it has errors", function() {
            beforeEach(function() {
                spyOn(chorus.router, "navigate")
                this.model.loggedInUser = new models.User({errors : "party"})
                this.model.logout();
            })

            it("navigates to /login", function() {
                expect(this.needsLoginSpy).toHaveBeenCalled();
            })
        })

        describe("when there is a chorus.user without errors", function(){
            beforeEach(function(){
                spyOn(chorus.router, "navigate")
                $.cookie("authid", "1234");
                this.model.loggedInUser = new models.User()
                this.model.logout();
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
                    expect(this.needsLoginSpy).toHaveBeenCalled();
                })
            })

        });
    })



    describe("#user", function() {
        beforeEach(function() {
            this.model = new models.Session();
            this.needsLoginSpy = jasmine.createSpy();
            this.model.bind("needsLogin", this.needsLoginSpy);
            chorus.session = this.model;
        });

        afterEach(function() {
            chorus.session = null;
        })


        describe("when there is a cookie", function() {
            beforeEach(function() {
                $.cookie("userName", "edcadmin");
            });

            it("returns a user with the correct userName", function() {
                expect(this.model.user().get("userName")).toBe("edcadmin");
            });
        });

        describe("when there isn't a cookie", function() {
            beforeEach(function() {
                $.cookie("userName", null);
            });
            it("should trigger needsLogin on user request", function() {
                var user = this.model.user();
//                expect(user).toBeUndefined();
                expect(this.needsLoginSpy).toHaveBeenCalled();
            });
        });
    });
});
