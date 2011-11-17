describe("chorus", function() {
    beforeEach(function() {
        this.chorus = new Chorus();
        this.backboneSpy = spyOn(Backbone.history, "start")
    })

    describe("#initialize", function() {
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
            expect(this.chorus.user).toBeDefined();
        });
    });
});