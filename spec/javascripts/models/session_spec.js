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
