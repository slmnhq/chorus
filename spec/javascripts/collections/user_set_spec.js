describe("chorus.collections.UserSet", function() {
    beforeEach(function() {
        this.collection = newFixtures.userSet();
    });

    it("has the correct urlTemplate", function() {
        expect(this.collection.urlTemplate).toBe("users/");
    })
});
