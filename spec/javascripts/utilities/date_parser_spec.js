describe("Date", function() {
    describe("#parseFromApi", function() {
        it("returns a falsy value when the date is in a bogus format", function() {
            expect(Date.parseFromApi("fooey")).toBeFalsy();
        })

        it("returns a falsy value when the date is a falsy value", function() {
            expect(Date.parseFromApi(false)).toBeFalsy();
        })

        it("Localizes UTC times into the browser's own time", function() {
            var date_str = Date.formatForApi(new Date())
            var parsed_date = Date.parseFromApi(date_str)
            expect((new Date() - parsed_date)).toBeLessThan(60 * 1000);
        })
    })
})
