describe("chorus.models.Activity", function() {
    beforeEach(function() {
        fixtures.model = 'Activity';
        this.model = fixtures.modelFor("fetch")
    });

    describe("#author", function() {
        it("creates a user", function() {
            expect(this.model.author().displayName()).toBe("EDC Admin");
        });

        it("returns the same instance when called multiple times", function() {
            expect(this.model.author()).toBe(this.model.author());
        });
    })

    describe("#headerHtml", function() {
        context("when the activity type is unknown", function() {
            it("returns a default header", function() {
                this.model.set({ type: "GEN MAI CHA" });
                expect(this.model.headerHtml()).toBeDefined();
            });
        });

        context("when the activity type is known", function() {
            it("returns an appropriate translated message", function() {
                this.model.set({ type: "NOTE" });
                expect(this.model.headerHtml()).toContain(this.model.author().displayName());
            });
        });
    });
});
