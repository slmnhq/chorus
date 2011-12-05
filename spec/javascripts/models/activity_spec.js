describe("chorus.models.Activity", function() {
    beforeEach(function() {
        fixtures.model = 'Activity';
        this.model = fixtures.modelFor("fetch")
    });

    describe("#author", function() {
        it("creates a user", function() {
            expect(this.model.author().displayName()).toBe("EDC Admin");
        });
    })
});
