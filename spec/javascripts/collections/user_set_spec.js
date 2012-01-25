describe("chorus.collections.UserSet", function() {
    beforeEach(function() {
        fixtures.model = 'UserSet';
        this.collection = new chorus.collections.UserSet();
    });

    it("has the correct urlTemplate", function() {
        expect(this.collection.urlTemplate).toBe("user/");
    })
});
