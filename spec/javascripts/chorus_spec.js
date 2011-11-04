describe("chorus", function(){
    describe("#intiailize", function(){
       beforeEach(function(){
           spyOn(Backbone.history, "start")
                      chorus.initialize()
       })
        it("should start the Backbone history", function(){
           expect(Backbone.history.start).toHaveBeenCalled();
       })
        it("should create a session", function(){
            expect(chorus.session).toBeDefined();
        })
    });
});