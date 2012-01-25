describe("chorus.views.DatasetListSidebar", function() {
    beforeEach(function() {
        this.view = new chorus.views.DatasetListSidebar();
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        context("when no dataset is selected", function () {
            it("does not render the info section", function() {
                expect(this.view.$(".info")).not.toExist();
            });
        })

        describe("dataset:selected event handling", function() {
            context("when a dataset is selected", function() {
                beforeEach(function() {
                    this.dataset = fixtures.datasetSourceTable();
                    this.view.trigger("dataset:selected", this.dataset);
                });

                it("displays the selected dataset name", function() {
                    expect(this.view.$(".name").text().trim()).toBe(this.dataset.get("objectName"))
                });

                it("displays the selected dataset type", function() {
                    expect(this.view.$(".type").text().trim()).toBe(this.view.datasetType(this.dataset));
                });

                it("fetches the statistics for the dataset", function() {
                    expect(this.server.lastRequest().url).toMatchUrl(this.dataset.statistics().url());
                });

                context("when the statistics arrive", function() {
                    beforeEach(function() {
                        this.stats = this.dataset.statistics();
                        this.stats.set({rows: 0, columns: 0, lastAnalyzedTime: "2011-12-12 12:34:56", onDiskSize: "1 GB", desc: "foo"});
                        this.server.completeFetchFor(this.stats);
                    });

                    it("displays rows when the value is 0", function() {
                        expect(this.view.$(".statistics .rows .value").text().trim()).toBe("0")
                    });

                    it("displays columns when the value is 0", function() {
                        expect(this.view.$(".statistics .columns .value").text().trim()).toBe("0")
                    });

                    it("displays the on disk size", function() {
                        expect(this.view.$(".size .value").text().trim()).toBe("1 GB");
                    });

                    it("displays the description", function() {
                        expect(this.view.$(".description p").text().trim()).toBe("foo");
                    });

                    it("displays the last analyzed time", function() {
                        expect(this.view.$(".last_analyzed_time .value").text()).toBe(chorus.helpers.relativeTimestamp(this.stats.get("lastAnalyzedTime")));
                    });
                });
            });
        });
    })

    describe("#datasetType", function() {
        it("uses a translation based on the type and objectType of the supplied dataset", function() {
            var dataset = fixtures.datasetSandboxTable();
            expect(this.view.datasetType(dataset)).toMatchTranslation("dataset.types.SANDBOX_TABLE.BASE_TABLE");
        });
    });
});
