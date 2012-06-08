describe("chorus.collections.UserSet", function() {
    beforeEach(function() {
        this.collection = rspecFixtures.userSet();
    });

    it("has the correct urlTemplate", function() {
        expect(this.collection.urlTemplate).toBe("users/");
    })
});
