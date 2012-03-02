describe("chorus.views.SearchResultList", function() {
    beforeEach(function() {
        this.model = fixtures.searchResult();
        this.view = new chorus.views.SearchResultList({model: this.model});
        this.view.render();
    });

    it("should include search results for a workfile", function() {
        expect(this.view.$(".search_workfile_list")).toExist();
    });

    it("should include the search results for tabular data", function() {
        expect(this.view.$(".search_tabular_data_list")).toExist();
    });
});