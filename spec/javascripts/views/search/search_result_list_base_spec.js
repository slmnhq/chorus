describe("chorus.views.SearchResultListBase", function() {
    beforeEach(function() {
        this.result = fixtures.searchResult();
        this.result.set({ query: "foo" });

        var instances = this.result.instances();
        instances.attributes.total = 24;

        this.view = new chorus.views.SearchResultListBase({
            entityType: "instance",
            collection: instances,
            query: this.result
        });

        this.view.render();
    });

    it("has a list element for each model in the collection", function() {
        expect(this.view.$('li').length).toBe(2);
    });
});
