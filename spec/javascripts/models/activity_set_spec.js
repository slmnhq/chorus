describe("ActivitySet", function() {
    beforeEach(function() {
        fixtures.model = 'ActivitySet';
        this.collection = new chorus.models.ActivitySet();
    });

    it("has the correct urlTemplate", function() {
        expect(this.collection.urlTemplate).toBe("activitystream/{{entityType}}/{{entityId}}");
    });
});

