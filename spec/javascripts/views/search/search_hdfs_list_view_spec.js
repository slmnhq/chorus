describe("chorus.views.SearchHdfsList", function() {
    beforeEach(function() {
        this.result = fixtures.searchResult({hdfs: {
            docs: [
                fixtures.searchResultHdfsJson({
                    path: "/aaa/bbb"
                }),
                fixtures.searchResultHdfsJson({
                    path: "/ddd/eee"
                }),
                fixtures.searchResultHdfsJson({
                    path: "/ggg/hhh"
                })
            ],
            numFound: 10}
        });

        this.models = this.result.hdfs();
        this.view = new chorus.views.SearchHdfsList({collection: this.models, query: this.result});
        this.view.render()
    });

    context("unfiltered search results", function() {
        describe("the details bar", function() {
            it("should display the title", function() {
                expect(this.view.$(".details .title")).toContainTranslation("search.type.hdfs");
            });

            it("should display the result count", function() {
                expect(this.view.$(".details .count")).toContainTranslation("search.count", {shown: 3, total: 10});
            });

            context("when the search has no additional results", function() {
                beforeEach(function() {
                    this.result = fixtures.searchResult({hdfs: {
                        docs: [
                            fixtures.searchResultHdfsJson(),
                            fixtures.searchResultHdfsJson()
                        ],
                        numFound: 2}
                    });
                    this.models = this.result.hdfs();
                    this.view = new chorus.views.SearchHdfsList({collection: this.models, query: this.result});
                    this.view.render();
                });

                it("displays the short count", function() {
                    expect(this.view.$(".details .count")).toContainTranslation("search.count_short", {shown: "2"});
                });

                it("has no show all results link", function() {
                    expect(this.view.$(".details a.show_all")).not.toExist();
                });
            });
        });
    });

    context("filtered search", function() {
        beforeEach(function() {
            this.result.set({entityType: "hdfs"});
            this.view.render();
        });

        describe("pagination bar", function() {
            it("has a count of total results", function() {
                expect(this.view.$('.pagination .count')).toContainTranslation("search.results", {count: 10})
            });

            context("when there are two pages of results", function() {
                beforeEach(function() {
                    spyOn(this.result, "totalPageNumber").andReturn(2);
                });

                context("and I am on the first page", function() {
                    beforeEach(function() {
                        spyOn(this.result, "hasPreviousPage").andReturn(false);
                        spyOn(this.result, "hasNextPage").andReturn(true);
                        this.view.render();
                    });

                    it("should have a next link", function() {
                        expect(this.view.$('.pagination a.next')).toExist();
                        expect(this.view.$('.pagination a.next')).toContainTranslation("search.next");
                    });

                    it("should not have a previous link", function() {
                        expect(this.view.$('.pagination a.previous')).not.toExist();
                    });

                    it("should have previous in plain text", function() {
                        expect(this.view.$('.pagination span.previous')).toContainTranslation("search.previous");
                    });

                    it("should have the 'Page x of y' text", function() {
                        expect(this.view.$('.pagination span.page_numbers')).toExist();
                        expect(this.view.$('.pagination span.page_numbers')).toContainTranslation("search.page", {shown: 1, total: 2})
                    });

                });

                context("and I am on the second page", function() {
                    beforeEach(function() {
                        spyOn(this.result, "hasNextPage").andReturn(false);
                        spyOn(this.result, "hasPreviousPage").andReturn(true);
                        this.view.render();
                    });

                    it("should have a previous link", function() {
                        expect(this.view.$('.pagination a.previous')).toExist();
                        expect(this.view.$('.pagination a.previous')).toContainTranslation("search.previous");
                    });

                    it("should not have a next link", function() {
                        expect(this.view.$('.pagination a.next')).not.toExist();
                    });

                    it("should have next in plain text", function() {
                        expect(this.view.$('.pagination span.next')).toContainTranslation("search.next");
                    });

                });
            });

            context("when there is one page of results", function() {
                beforeEach(function() {
                    spyOn(this.result, "hasNextPage").andReturn(false);
                    spyOn(this.result, "hasPreviousPage").andReturn(false);
                    this.view.render();
                });

                it("should not have next and previous links", function() {
                    expect(this.view.$('.pagination a.next')).not.toExist();
                    expect(this.view.$('.pagination a.previous')).not.toExist();
                });

                it("should have next and previous in plain text", function() {
                    expect(this.view.$('.pagination span.next')).toContainTranslation("search.next");
                    expect(this.view.$('.pagination span.previous')).toContainTranslation("search.previous");
                });

                it ("should not have the 'Page x of y' text", function (){
                    expect(this.view.$('.pagination span.page_numbers')).not.toExist();
                });
            })
        });
    })

    describe("the result list", function() {
        it("should render a list item for each result", function() {
            expect(this.view.$("li.result_item").length).toBe(3);
        });
    });
});