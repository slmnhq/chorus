describe("chorus.views.SearchResultListBase", function() {
    beforeEach(function() {
        this.result = fixtures.searchResult();
                this.result.set({ query: "jackson5", entityType: "user" });
                this.models = this.result.users();
                this.view = new chorus.views.SearchResultListBase({
                    className: "search_user_list",
                    collection: this.models,
                    query: this.result,
                    additionalClass: "list"
                });

                spyOn(this.view, "additionalContext").andReturn(
                    {
                        shown: true,
                        filteredSearch: true,
                        hasNext: true,
                        hasPrevious: true,
                        total: 5
                    }
                );

        this.view.render();
    });

    describe("next and previous buttons", function() {
        context("when I click next", function() {
            beforeEach(function() {
                spyOn(this.result, "hasNextPage").andReturn(true);
                spyOn(this.view, "render");

                this.view.$('.pagination a.next').click();
            });

            it("should set the page to 2", function() {
                expect(this.result.get("page")).toBe(2);
            });

            it("should fetch the second page of results", function() {
                expect(this.server.lastFetch().url).toMatchUrl("/edc/search/global/?query=jackson5&entityType=user&rows=50&page=2")
            })

            it("should re-render", function() {
                expect(this.view.render).toHaveBeenCalled();
            });

        })

        context("when I click previous", function() {
            beforeEach(function() {
                spyOn(this.result, "hasPreviousPage").andReturn(true);
                spyOn(this.view, "render");
                this.result.set({page: 2});
                this.view.$('.pagination a.previous').click();
            });

            it("should set the page to 1", function() {
                expect(this.result.get("page")).toBe(1);
            });

            it("should fetch the first page of results", function() {
                expect(this.server.lastFetch().url).toMatchUrl("/edc/search/global/?query=jackson5&entityType=user&rows=50&page=1")
            })

            it("should re-render", function() {
                expect(this.view.render).toHaveBeenCalled();
            });
        });
    });

});