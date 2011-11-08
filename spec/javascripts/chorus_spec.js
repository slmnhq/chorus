describe("chorus", function() {
    beforeEach(function() {
        this.chorus = new Chorus();
        this.backboneSpy = spyOn(Backbone.history, "start")
    })

    describe("#initialize", function() {
        beforeEach(function(){
            this.user = new chorus.models.User()
            spyOn(this.chorus, "fetchUser").andReturn(this.user)
        })

        it("should start the Backbone history after the user has been set", function() {
            var self = this;
            expect(this.chorus.user).toBeUndefined();
            this.backboneSpy.andCallFake(function(){expect(self.chorus.user).toBeDefined();});
            this.chorus.initialize()
            expect(Backbone.history.start).toHaveBeenCalled();
        })

        it("should create a session", function() {
            this.chorus.initialize()
            expect(this.chorus.session).toBeDefined();
        })

        it("should set a user", function(){
            this.chorus.initialize();
            expect(this.chorus.user).toBe(this.user);
        });
    });

    describe("#fetchUser", function() {
        context("when the session has no user", function() {
            beforeEach(function() {
                spyOn(this.chorus, "requireLogin");
                this.chorus.initialize();
                $.cookie("userName", null);
            })

            it("should call requireLogin", function() {
                this.chorus.session.trigger("needsLogin");
                expect(this.chorus.requireLogin).toHaveBeenCalled();
            })
        })

        context("when the session has a user", function() {
            beforeEach(function() {
                $.cookie("userName", "edcadmin");
                this.chorus.initialize()
                spyOn(this.chorus.router, "navigate");
            })

            it("should have fetched the user", function(){
                expect(this.server.requests[0].url).toContain("/edc/user/edcadmin");
            });

//            context("when the user is valid", function() {
//                it("should not redirect to login", function() {
//                    //respond happy
//                    expect(this.chorus.router.navigate).not.toHaveBeenCalled();
//                })
//            })
////
//            context("whe the user is invalid", function() {
//                it("should redirect to login", function() {
//                    //respond sad
//                    expect(this.chorus.router.navigate).toHaveBeenCalledWith("/login");
//                })
//            })
        })
    })

});