describe("chorus.models.Config", function() {

    it("has a valid url", function() {
        var config = chorus.models.Config.instance();
        expect(config.url()).toBe("/edc/config/");
    });

    describe(".instance", function() {
        beforeEach(function() {
            spyOn(chorus.models.Config.prototype, 'fetch');
        });

        it("returns an instance", function() {
            expect(chorus.models.Config.instance()).toBeA(chorus.models.Config);
        });

        it("returns a singleton object", function() {
            expect(chorus.models.Config.instance()).toBe(chorus.models.Config.instance());
        });

        it("fetches itself once", function() {
            expect(chorus.models.Config.instance().fetch).toHaveBeenCalled();
            expect(chorus.models.Config.instance().fetch.callCount).toBe(1);
        });
    });

    describe("#isExternalAuth", function() {
        beforeEach(function() {
            this.model = new chorus.models.Config({ externalAuth: true })
        });

        it("returns externalAuth", function() {
            expect(this.model.isExternalAuth()).toBeTruthy();
        })
    })
});
