describe("chorus.models.Notification", function() {
    beforeEach(function() {
        this.model = fixtures.notification()
    })

    describe("initialization", function() {
        it("has the correct url template", function() {
            expect(this.model.urlTemplate).toBe("alert/{{id}}")
        })
    })
})