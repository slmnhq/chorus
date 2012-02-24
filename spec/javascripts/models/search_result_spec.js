describe("chorus.models.SearchResult", function() {
    beforeEach(function() {
        this.model = new chorus.models.SearchResult({query: "the longest query in the world"})
    });

    it("returns a short name", function() {
        expect(this.model.displayShortName()).toBe("the longest query in...")
    })
})