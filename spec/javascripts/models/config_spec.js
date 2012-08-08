describe("chorus.models.Config", function() {
    var config;
    beforeEach(function() {
        config = rspecFixtures.config();
    });

    it("has a valid url", function() {
        expect(config.url()).toBe("/config/");
    });

    describe(".instance", function() {
        beforeEach(function() {
            spyOn(chorus.models.Config.prototype, 'fetch').andCallThrough();
        });

        it("returns an instance", function() {
            expect(chorus.models.Config.instance()).toBeA(chorus.models.Config);
        });

        it("returns a singleton object", function() {
            expect(chorus.models.Config.instance()).toBe(chorus.models.Config.instance());
        });

        it("fetches itself once", function() {
            this.server.completeFetchFor(chorus.models.Config.instance());

            expect(chorus.models.Config.instance().fetch).toHaveBeenCalled();
            expect(chorus.models.Config.instance().fetch.callCount).toBe(1);
        });
    });

    describe("#isExternalAuth", function() {
        it("returns externalAuthEnabled", function() {
            expect(config.isExternalAuth()).toBeTruthy();
        })
    })

    describe("#fileSizeMbWorkfiles", function() {
        it("returns the workfiles size limit", function() {
            expect(config.fileSizeMbWorkfiles()).toBe(10);
        });
    });

    describe("#fileSizeMbCsvImports", function() {
        it("returns the csv import size limit", function() {
            expect(config.fileSizeMbCsvImports()).toBe(1);
        });
    });

    describe("#timezoneOffset", function() {
        it("returns the server's timezone offset as an integer multiple of one hundred", function() {
            var config = rspecFixtures.config({ timezoneOffset: "-8" });
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
