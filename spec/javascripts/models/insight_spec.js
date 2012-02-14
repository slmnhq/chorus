describe("chorus.models.Insight", function() {
    beforeEach(function() {
        this.model = new chorus.models.Insight();
    });

    it("should have the correct url template", function() {
        expect(this.model.url()).toContain("/edc/insight");
    });
});
