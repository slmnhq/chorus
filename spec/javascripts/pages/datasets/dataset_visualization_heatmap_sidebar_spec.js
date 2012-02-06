describe("chorus.views.DatasetVisualizationHeatmapSidebar", function() {
    describe("#render", function() {
        context("with valid column data", function() {
            beforeEach(function() {
                this.column1 = fixtures.databaseColumn({typeCategory: 'REAL_NUMBER', name: "Rotten Eggs"});
                this.columns = fixtures.databaseColumnSet([this.column1]);

                this.model = fixtures.datasetChorusView({objectName: "Foo"});
                this.view = new chorus.views.DatasetVisualizationHeatmapSidebar({model: this.model, collection: this.columns})
                this.view.render();
            })

            describe("input select boxes", function() {
                it("populates the X axis box with numeric columns", function() {
                    expect(this.view.$(".x_axis select option").length).toBe(this.view.numericColumnNames().length);
                })
                it("populates the Y axis box with numeric columns", function() {
                    expect(this.view.$(".y_axis select option").length).toBe(this.view.numericColumnNames().length);
                })
            })

            itBehavesLike.DatasetVisualizationSidebarRangeChooser('.limiter.x_axis');
            itBehavesLike.DatasetVisualizationSidebarRangeChooser('.limiter.y_axis');

            describe("#chartOptions", function() {
                it("should return all the chart options for a heatmap", function() {
                    var options = this.view.chartOptions();
                    expect(options.name).toBe("Foo");
                    expect(options.type).toBe("heatmap");
                    expect(options.xAxis).toBe("Rotten Eggs");
                    expect(options.yAxis).toBe("Rotten Eggs");
                    expect(options.xBins).toBe("20");
                    expect(options.yBins).toBe("20");
                })
            });
        })

        context("with no columns", function() {
            beforeEach(function() {
                this.columns = new chorus.collections.DatabaseColumnSet();
                this.view = new chorus.views.DatasetVisualizationHeatmapSidebar({model: this.model, collection: this.columns})
                this.view.render();
            })

            it("should display 'No numerical columns' instead of the numerical column selector for x_axis", function() {
                expect(this.view.$(".x_axis select option")).not.toExist()
                expect(this.view.$(".x_axis .no_columns").text()).toContainTranslation("dataset.visualization.sidebar.no_numerical_columns")
            })

            it("should display 'No numerical columns' instead of the numerical column selector for y_axis", function() {
                expect(this.view.$(".y_axis select option")).not.toExist()
                expect(this.view.$(".y_axis .no_columns").text()).toContainTranslation("dataset.visualization.sidebar.no_numerical_columns")
            })
        })
    })
})