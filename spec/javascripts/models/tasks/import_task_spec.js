describe("chorus.models.ImportTask", function() {
    beforeEach(function() {
        this.model = new chorus.models.ImportTask();
    });

    it("has the sourceType set to dataset", function() {
        expect(this.model.get('sourceType')).toBe("dataset");
    })
});
