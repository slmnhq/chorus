describe("chorus.models.Draft", function() {
    describe("#urls", function() {
        beforeEach(function() {
            this.model = new chorus.models.Draft({workfileId: 5, workspaceId: 10})
        });

        it("has the right URL", function() {
            expect(this.model.url()).toBe("/workfiles/5/draft");
        });
    });
});