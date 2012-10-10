describe("chorus.collections.GnipInstanceSet", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.GnipInstanceSet();
    });

    it("has the right url", function() {
        expect(this.collection.url()).toHaveUrlPath("/gnip_instances");
    });
});
