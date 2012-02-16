describe("chorus.models.ChorusView", function() {
    beforeEach(function() {
        this.model = fixtures.chorusView();
    });

    it("extends Dataset", function() {
        expect(this.model).toBeA(chorus.models.Dataset);
    });
});
