describe("Date", function() {
    describe("#parseFromApi", function() {
        it("parses dates with one-digit milliseconds", function() {
            var time = Date.parseFromApi("2011-11-16 09:40:27.6").getTime();
            expect(time).toBeTruthy();
            expect(time).toBe(Date.parse("2011-11-16 09:40:27").getTime())
        })

        it("parses dates with two-digit milliseconds", function() {
            var time = Date.parseFromApi("2011-11-16 09:40:27.16").getTime();
            expect(time).toBeTruthy();
            expect(time).toBe(Date.parse("2011-11-16 09:40:27").getTime())
        })

        it("parses dates with three-digit milliseconds", function() {
            var time = Date.parseFromApi("2011-11-16 09:40:27.456").getTime();
            expect(time).toBeTruthy();
            expect(time).toBe(Date.parse("2011-11-16 09:40:27").getTime())
        })

        it("parses dates without milliseconds", function() {
            var time = Date.parseFromApi("2011-11-16 09:40:27").getTime();
            expect(time).toBeTruthy();
            expect(time).toBe(Date.parse("2011-11-16 09:40:27").getTime())
        })

        it("parses dates with milliseconds and timezone", function() {
            var time = Date.parseFromApi("2011-11-16 09:40:27.146-8").getTime();
            expect(time).toBeTruthy();
            expect(time).toBe(Date.parse("2011-11-16 09:40:27").getTime())
        })

        it("returns a falsy value when the date is in a bogus format", function() {
            expect(Date.parseFromApi("fooey")).toBeFalsy();
        })

        it("returns a falsy value when the date is a falsey value", function() {
            expect(Date.parseFromApi(false)).toBeFalsy();
        })
    })
})