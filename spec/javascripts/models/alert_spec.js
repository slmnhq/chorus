describe("chorus.models.Alert", function() {
    beforeEach(function() {
        this.model = fixtures.alert()
    })

    describe("initialization", function() {
        it("has the correct url template", function() {
            expect(this.model.urlTemplate).toBe("alert/{{id}}")
        })
    })
})