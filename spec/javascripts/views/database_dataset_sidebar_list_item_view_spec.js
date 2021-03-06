describe("chorus.views.DatabaseDatasetSidebarListItem", function() {
    beforeEach(function() {
        spyOn(chorus.PageEvents, "broadcast").andCallThrough();
        this.collection = new chorus.collections.DatasetSet([
            rspecFixtures.dataset({ schema: { name: "schema_name"}, objectName: "1234",  type: "SANDBOX_TABLE", objectType: "TABLE" }),
            rspecFixtures.dataset({ schema: { name: "schema_name"}, objectName: "Data1", type: "SANDBOX_TABLE", objectType: "VIEW" }),
            rspecFixtures.dataset({ schema: { name: "schema_name"}, objectName: "Data2", type: "SANDBOX_TABLE", objectType: "TABLE" }),
            rspecFixtures.dataset({ schema: { name: "schema_name"}, objectName: "zebra", type: "SANDBOX_TABLE", objectType: "VIEW" })
        ]);
        this.view = new chorus.views.DatabaseDatasetSidebarListItem({collection: this.collection});
        this.view.render();
    });

    it("displays a loading section", function() {
        expect(this.view.$(".loading_section")).toExist();
    });

    context("when the collection is loaded", function() {
        beforeEach(function() {
            this.collection.loaded = true;
            this.view.render();
        });

        it("renders an li for each item in the list", function() {
            expect(this.view.$("li").length).toBe(4);
        });

        it("renders the correct data-fullname for each item", function() {
            var $lis = this.view.$("li");
            expect($lis.eq(0).data("fullname")).toBe('schema_name."1234"');
            expect($lis.eq(1).data("fullname")).toBe('schema_name."Data1"');
            expect($lis.eq(2).data("fullname")).toBe('schema_name."Data2"');
            expect($lis.eq(3).data("fullname")).toBe("schema_name.zebra");
        });

        it("renders appropriate icon for each item in the collection", function() {
            var $lis = this.view.$("li img");
            expect($lis.eq(0)).toHaveAttr("src", "/images/sandbox_table_medium.png");
            expect($lis.eq(1)).toHaveAttr("src", "/images/sandbox_view_medium.png");
            expect($lis.eq(2)).toHaveAttr("src", "/images/sandbox_table_medium.png");
            expect($lis.eq(3)).toHaveAttr("src", "/images/sandbox_view_medium.png");
        });

        describe("clicking on a dataset item", function () {
            beforeEach(function() {
                this.view.$("li a").eq(0).click();
            });

            it("broadcasts a 'datasetSelected' event, with the view", function() {
                var clickedDataset = this.view.collection.findWhere({objectName: this.collection.at(0).get("objectName")});
                expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("datasetSelected", clickedDataset);
            });
        });

        describe("pagination", function() {
            beforeEach(function() {
                this.collection.reset([
                    rspecFixtures.dataset({objectName: "Table 1"}),
                    rspecFixtures.dataset({objectName: "Table 2"})
                ]);
            });

            context("when there is more than one page of results", function() {
                beforeEach(function() {
                    this.collection.pagination = { page: "1", total: "2" };
                    this.view.render();
                });

                it("shows the more link", function() {
                    expect(this.view.$("a.more")).toContainTranslation("schema.metadata.more");
                });

                context("when the more link is clicked", function() {
                    beforeEach(function() {
                        spyOnEvent(this.view, "fetch:more");
                        this.view.$("a.more").click();
                    });

                    it("triggers a 'fetch:more event on itself", function() {
                        expect("fetch:more").toHaveBeenTriggeredOn(this.view);
                    });
                });
            });

            context("when there is only one page of results", function() {
                beforeEach(function() {
                    this.collection.pagination = { page: "1", total: "1" };
                    this.view.render();
                });

                it("doesn't show the more link", function() {
                    expect(this.view.$("a.more")).not.toExist();
                });
            });
        });
    });
});
