describe("chorus.models.Draft", function() {
    describe("#urls", function() {
        beforeEach(function() {
            this.model = new chorus.models.Draft({id: 5, workspaceId: 10})
        });

        it("has the right URL", function() {
            expect(this.model.url()).toBe("/edc/workspace/10/workfile/5/draft");
        });
    });
});