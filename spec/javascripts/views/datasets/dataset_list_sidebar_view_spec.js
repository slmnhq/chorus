describe("chorus.views.DatasetListSidebar", function() {
    beforeEach(function() {
        this.view = new chorus.views.DatasetListSidebar();
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        context("when no dataset is selected", function() {
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

                it("sets the note link's displayEntityType to the dataset's metatype", function() {
                    expect(this.view.$("a.dialog").data("display-entity-type")).toBe(this.dataset.metaType());
                });

                it("displays the selected dataset name", function() {
                    expect(this.view.$(".name").text().trim()).toBe(this.dataset.get("objectName"))
                });

                it("displays the selected dataset type", function() {
                    expect(this.view.$(".type").text().trim()).toBe(this.view.datasetType(this.dataset));
                });

                it("displays the preview data link", function() {
                    expect(this.view.$('.actions .dialog.dataset_preview').data('dialog')).toBe('DatasetPreview');
                    expect(this.view.$('.actions .dataset_preview')).toContainTranslation('actions.dataset_preview');
                });

                it("fetches the activities for the dataset", function() {
                    expect(this.dataset.activities()).toHaveBeenFetched()
                });
                
                it("prefers only the without_object type for the activity list", function() {
                    expect(this.view.activityList.options.displayStyle).toEqual(['without_object']);
                });

                describe("when the activity fetch completes", function() {
                    beforeEach(function() {
                        this.server.completeFetchFor(this.dataset.activities());
                    });

                    it("renders an activity list inside the tabbed area", function() {
                        expect(this.view.activityList).toBeA(chorus.views.ActivityList);
                        expect(this.view.activityList.el).toBe(this.view.$(".tabbed_area .activity_list")[0]);
                    });
                });

                it("fetches the statistics for the dataset", function() {
                    expect(this.dataset.statistics()).toHaveBeenFetched()
                });

                context("when the statistics arrive", function() {
                    beforeEach(function() {
                        this.stats = this.dataset.statistics();
                        this.stats.set({
                            rows: 0,
                            columns: 0,
                            lastAnalyzedTime: "2011-12-12 12:34:56",
                            onDiskSize: "1 GB",
                            desc: "foo",
                            partitions: 2
                        });
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

                    it("displays the partitions", function() {
                        expect(this.view.$(".partitions .value").text()).toBe("2")
                    })

                    it("displays the statistics in the correct order", function() {
                        expect(this.view.$(".statistics .pair").eq(0).find(".key").text().trim()).toMatchTranslation("dataset.statistics.type");
                        expect(this.view.$(".statistics .pair").eq(1).find(".key").text().trim()).toMatchTranslation("dataset.statistics.partitions");
                        expect(this.view.$(".statistics .pair").eq(2).find(".key").text().trim()).toMatchTranslation("dataset.statistics.columns");
                        expect(this.view.$(".statistics .pair").eq(3).find(".key").text().trim()).toMatchTranslation("dataset.statistics.last_analyzed_time");
                        expect(this.view.$(".statistics .pair").eq(4).find(".key").text().trim()).toMatchTranslation("dataset.statistics.rows");
                        expect(this.view.$(".statistics .pair").eq(5).find(".key").text().trim()).toMatchTranslation("dataset.statistics.size");
                    });

                    describe("when the partitions are 0", function() {
                        beforeEach(function() {
                            this.view = new chorus.views.DatasetListSidebar();
                            this.view.setDataset(this.dataset);
                            this.stats.set({ partitions: 0 });
                            this.view.render();
                        });

                        it("should not show the partitions pair", function() {
                            expect(this.view.$(".partitions")).not.toExist()
                        })
                    })

                    describe("when the lastAnalyzedTime is null", function() {
                        beforeEach(function() {
                            this.view = new chorus.views.DatasetListSidebar();
                            this.view.setDataset(this.dataset)
                            this.stats.set({ lastAnalyzedTime: null, rows: 5837 });
                            this.view.render();
                        })

                        it("should not display the lastAnalyzedTime or row count", function() {
                            expect(this.view.$(".rows")).not.toExist();
                            expect(this.view.$(".last_analyzed_time")).not.toExist();
                        });
                    });
                });
            });
        });
    })

    describe("#datasetType", function() {
        it("uses a translation based on the type and objectType of the supplied dataset", function() {
            var dataset;

            dataset = fixtures.datasetSandboxTable();
            expect(this.view.datasetType(dataset)).toMatchTranslation("dataset.types.SANDBOX_TABLE.BASE_TABLE");

            dataset = fixtures.datasetChorusView();
            expect(this.view.datasetType(dataset)).toMatchTranslation("dataset.types.CHORUS_VIEW");

            dataset = fixtures.datasetSourceTable();
            expect(this.view.datasetType(dataset)).toMatchTranslation("dataset.types.SOURCE_TABLE.BASE_TABLE");

            dataset = fixtures.datasetHadoopExternalTable();
            expect(this.view.datasetType(dataset)).toMatchTranslation("dataset.types.SANDBOX_TABLE.HDFS_EXTERNAL_TABLE");

            dataset = fixtures.datasetSourceView();
            expect(this.view.datasetType(dataset)).toMatchTranslation("dataset.types.SOURCE_TABLE.VIEW");
        });
    });
});
