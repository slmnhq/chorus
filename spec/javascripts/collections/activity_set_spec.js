describe("chorus.collections.ActivitySet", function() {
    beforeEach(function() {
        fixtures.model = 'ActivitySet';
        this.collection = new chorus.collections.ActivitySet();
    });

    it("has the correct urlTemplate", function() {
        expect(this.collection.urlTemplate).toBe("activitystream/{{entityType}}/{{entityId}}");
    });
});

