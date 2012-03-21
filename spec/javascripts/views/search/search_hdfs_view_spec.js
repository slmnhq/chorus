describe("chorus.views.SearchHdfs", function() {
    describe("when the file is not a binary file", function() {
        beforeEach(function() {
            this.result = fixtures.searchResult({hdfs: {
                docs: [
                    fixtures.searchResultHdfsJson({
                        path: "/aaa/bbb",
                        isDir: false,
                        isBinary: false
                    })
                ],
                numFound: 10}
            });

            this.model = this.result.hdfs().models[0];
            this.view = new chorus.views.SearchHdfs({model: this.model});
            this.view.render()
        });

        it("should render the name for each file", function() {
            expect(this.view.$("a.name")).toContainText(this.model.get("name"));
        });

        it("should render the instance location", function() {
            var $inst = this.view.$(".instance a");

            expect($inst.text()).toBe("hadoop");
            expect($inst.attr("href")).toBe("#/instances/10001/browse/");
        });

        it("should render a link to each file", function() {
            expect(this.view.$('a.name').attr('href')).toMatchUrl(this.model.showUrl());
        });

        it("should render the location for each file", function() {
            var $links = this.view.$(".path_parts a");
            expect($links.length).toBe(2);

            expect($links.eq(0).text()).toBe("aaa");
            expect($links.eq(0).attr("href")).toBe("#/instances/10001/browse/aaa");

            expect($links.eq(1).text()).toBe("bbb");
            expect($links.eq(1).attr("href")).toBe("#/instances/10001/browse/aaa/bbb");
        });

    })

    describe("when the file is a binary file", function() {
        beforeEach(function() {
            this.result = fixtures.searchResult({hdfs: {
                docs: [
                    fixtures.searchResultHdfsJson({
                        path: "/aaa/bbb",
                        isDir: false,
                        isBinary: true
                    })
                ],
                numFound: 10}
            });

            this.model = this.result.hdfs().models[0];
            this.view = new chorus.views.SearchHdfs({model: this.model});
            this.view.render()
        });

         it("should render the instance location", function() {
            var $inst = this.view.$(".instance a");

            expect($inst.text()).toBe("hadoop");
            expect($inst.attr("href")).toBe("#/instances/10001/browse/");
        });

        it("should not render a link to each file", function() {
            expect(this.view.$('a.name')).not.toExist();
            expect(this.view.$("span.name").text()).toContainText(this.model.get("name"));
        });

        it("should render the location for each file", function() {
            var $links = this.view.$(".path_parts a");
            expect($links.length).toBe(2);

            expect($links.eq(0).text()).toBe("aaa");
            expect($links.eq(0).attr("href")).toBe("#/instances/10001/browse/aaa");

            expect($links.eq(1).text()).toBe("bbb");
            expect($links.eq(1).attr("href")).toBe("#/instances/10001/browse/aaa/bbb");
        });
    })
});