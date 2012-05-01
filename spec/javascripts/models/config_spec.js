describe("chorus.models.Config", function() {

    it("has a valid url", function() {
        var config = chorus.models.Config.instance();
        expect(config.url()).toBe("/config/");
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
            this.model = new chorus.models.Config({ external_auth_enabled: true })
        });

        it("returns external_auth_enabled", function() {
            expect(this.model.isExternalAuth()).toBeTruthy();
        })
    })

    describe("#timezoneOffset", function() {
        it("returns the server's timezone offset as an integer multiple of one hundred", function() {
            var config = newFixtures.config({ timezoneOffset: "-8" });
            expect(config.timezoneOffset()).toBe(-800);
        });

        context("when the information is not-yet fetched", function() {
            it("returns a falsy value", function() {
                var config = new chorus.models.Config();
                expect(config.timezoneOffset()).toBeFalsy();
            });
        });
    });
});
