describe("chorus.views.SearchHdfsList", function() {
    beforeEach(function() {
        this.result = fixtures.searchResult({hdfs: {
            docs: [
                fixtures.searchResultHdfsJson(),
                fixtures.searchResultHdfsJson(),
                fixtures.searchResultHdfsJson()
            ],
            numFound: "5"}
        });
        this.models = this.result.hdfs();
        this.view = new chorus.views.SearchHdfsList({collection: this.models, total: "10", query: this.result});
        this.view.render()
    });

    describe("the details bar", function() {
        it("should display the title", function() {
            expect(this.view.$(".details .title")).toContainTranslation("search.type.hadoop");
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
                    numFound: "2"}
                });
                this.models = this.result.hdfs();
                this.view = new chorus.views.SearchHdfsList({collection: this.models, total: "2", query: this.result});
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