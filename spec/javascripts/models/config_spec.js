describe("chorus.models.Config", function() {
    beforeEach(function() {
        this.model = new chorus.models.Config();
    });

    it("has a valid url", function() {
        expect(this.model.url()).toBe("/edc/config/");
    });
});
