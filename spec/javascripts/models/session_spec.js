describe("chorus.models.Login", function() {
    var models = chorus.models;
    beforeEach(function() {
        fixtures.model = 'Login';
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

    describe("#user", function() {
        beforeEach(function() {
            this.model = new models.Session();
            this.needsLoginSpy = jasmine.createSpy();
            this.model.bind("needsLogin", this.needsLoginSpy);
            chorus.session = this.model;
        });
        afterEach(function(){
            chorus.session = null;
        })


        describe("when there is a cookie", function() {
            beforeEach(function() {
                $.cookie("authuser", "edcadmin");
            });

            it("returns a user with the correct userName", function() {
                expect(this.model.user().get("userName")).toBe("edcadmin");
            });

            describe("when the cookie isn't valid", function(){
                beforeEach(function(){
                    this.model.user().parse({
                        status : "needsLogin"
                    })
                });

                it("should trigger needsLogin", function(){
                    expect(this.needsLoginSpy).toHaveBeenCalled();
                })
            })
        });

        describe("when there isn't a cookie", function() {
            beforeEach(function() {
                $.cookie("authuser", null);
            });
            it("should trigger needsLogin on user request", function() {
                var user = this.model.user();
//                expect(user).toBeUndefined();
                expect(this.needsLoginSpy).toHaveBeenCalled();
            });
        });
    });
});
