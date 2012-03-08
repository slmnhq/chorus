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
            numFound: "5"}
        });

        this.models = this.result.hdfs();
        this.view = new chorus.views.SearchHdfsList({collection: this.models, total: "10", query: this.result});
        this.view.render()
    });

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

    describe("the result list", function() {
        it("should render a list item for each result", function() {
            expect(this.view.$("li.result_item").length).toBe(3);
        });

        it("should render the name for each file", function() {
            expect(this.view.$("li.result_item:eq(0) a.name")).toContainText(this.models.at(0).get("name"));
        });

        it("should render the instance location", function() {
            var $inst = this.view.$("li.result_item:eq(0) .instance a");

            expect($inst.text()).toBe("hadoop");
            expect($inst.attr("href")).toBe("#/instances/10001/browse/");
        });

        it("should render a link to each file", function() {
            expect(this.view.$('a.name:eq(0)').attr('href')).toMatchUrl(this.models.at(0).showUrl());
        });

        it("should render the location for each file", function() {
            var $links = this.view.$("li.result_item:eq(0) .path_parts a");
            expect($links.length).toBe(2);

            expect($links.eq(0).text()).toBe("aaa");
            expect($links.eq(0).attr("href")).toBe("#/instances/10001/browse/aaa");

            expect($links.eq(1).text()).toBe("bbb");
            expect($links.eq(1).attr("href")).toBe("#/instances/10001/browse/aaa/bbb");
        });
    });
});