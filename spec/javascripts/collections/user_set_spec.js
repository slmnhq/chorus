describe("UserSet", function() {
    var models = chorus.models;

    beforeEach(function() {
        fixtures.model = 'UserSet';
        this.collection = new models.UserSet();
    });

    it("has the correct urlTemplate", function() {
        expect(this.collection.urlTemplate).toBe("user/");
    })
});
