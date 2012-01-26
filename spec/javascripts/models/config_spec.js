describe("chorus.models.Config", function() {
    beforeEach(function() {
        this.model = new chorus.models.Config();
    });

    it("has a valid url", function() {
        expect(this.model.url()).toBe("/edc/config/");
    });

    describe("instance", function() {
        it("returns an instance", function() {
            expect(chorus.models.Config.instance()).toBeA(chorus.models.Config);
        });

        it("returns a singleton object", function() {
            expect(chorus.models.Config.instance()).toBe(chorus.models.Config.instance());
        });
    });
});
