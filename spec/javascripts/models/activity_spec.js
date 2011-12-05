describe("chorus.models.Activity", function() {
    beforeEach(function() {
        fixtures.model = 'Activity';
        this.model = fixtures.modelFor("fetch")
    });

    describe("#authorDisplayName", function() {
        it("returns the full name", function() {
            expect(this.model.authorDisplayName()).toBe("EDC Admin");
        });
    })
});
