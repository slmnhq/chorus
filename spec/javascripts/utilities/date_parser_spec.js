describe("Date", function() {
    describe("#parseFromApi", function() {
        it("parses dates with one-digit milliseconds", function() {
            var date = Date.parseFromApi("2011-11-16 09:40:27.6");
            expect(date).toEqual(Date.parse("2011-11-16 09:40:27"));
        })

        it("parses dates with two-digit milliseconds", function() {
            var date = Date.parseFromApi("2011-11-16 09:40:27.16");
            expect(date).toEqual(Date.parse("2011-11-16 09:40:27"));
        })

        it("parses dates with three-digit milliseconds", function() {
            var date = Date.parseFromApi("2011-11-16 09:40:27.456");
            expect(date).toEqual(Date.parse("2011-11-16 09:40:27"));
        })

        it("parses dates without milliseconds", function() {
            var date = Date.parseFromApi("2011-11-16 09:40:27");
            expect(date).toEqual(Date.parse("2011-11-16 09:40:27"))
        })

        it("returns a falsy value when the date is in a bogus format", function() {
            expect(Date.parseFromApi("fooey")).toBeFalsy();
        })

        it("returns a falsy value when the date is a falsey value", function() {
            expect(Date.parseFromApi(false)).toBeFalsy();
        })

        it("ignores a timezone value if given, and uses local time", function() {
            var date = Date.parseFromApi("2011-11-16 09:40:27.146-8");
            expect(date).toEqual(Date.parse("2011-11-16 09:40:27"))
        })

        context("when the server configuration is fetched", function() {
            it("uses the server's timezone offset", function() {
                chorus.models.Config.instance().set({ timezoneOffset: "-4" });
                var date = Date.parseFromApi("2011-11-16 09:40:27.146");
                expect(date).toEqual(Date.parse("2011-11-16 09:40:27 -400"));
            });
        });
    })
})
