describe("chorus.models.User", function() {
    var models = chorus.models;
    beforeEach(function() {
        fixtures.model = 'User';
        this.model = new models.User();
    });

    it("has the correct urlTemplate", function() {
        expect(this.model.urlTemplate).toBe("/user/{{userName}}");
    })
});