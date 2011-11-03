describe("chorus.models.Login", function() {
    var models = chorus.models;
    beforeEach(function() {
        fixtures.model = 'Login';
    });

    describe("#save", function() {
      beforeEach(function() {
        this.model = new models.Login({ userName : "johnjohn", password : "partytime"});
        this.model.save();
      });

      it("has the right url", function() {
        expect(this.server.requests[0].url).toBe("/edc/auth/login/");
      });

      it("has the right method", function() {
        expect(this.server.requests[0].method).toBe("POST");
      });
    });

});
