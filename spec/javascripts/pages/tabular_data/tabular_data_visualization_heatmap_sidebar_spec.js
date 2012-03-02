describe("chorus.views.TabularDataVisualizationHeatmapSidebar", function() {
    describe("#render", function() {
        context("with valid column data", function() {
            beforeEach(function() {
                this.column1 = fixtures.databaseColumn({typeCategory: 'REAL_NUMBER', name: "Rotten Eggs"});
                this.column2 = fixtures.databaseColumn({typeCategory: 'REAL_NUMBER', name: "Zesty Eggs"});
                this.columns = fixtures.databaseColumnSet([this.column1, this.column2]);

                this.model = fixtures.datasetChorusView({objectName: "Foo"});
                this.view = new chorus.views.TabularDataVisualizationHeatmapSidebar({model: this.model, collection: this.columns})

                spyOn(chorus, 'styleSelect').andCallFake(_.bind(function() {
                    this.styledSelected = this.view.$(".y_axis select").val()
                }, this));

                this.view.render();
            })

            describe("input select boxes", function() {
                it("populates the X axis box with numeric columns", function() {
                    expect(this.view.$(".x_axis select option").length).toBe(this.view.numericColumnNames().length);
                })
                it("populates the Y axis box with numeric columns", function() {
                    expect(this.view.$(".y_axis select option").length).toBe(this.view.numericColumnNames().length);
                })

                it("pre-selects the first column in the X axis box select", function() {
                    var selected = this.view.$(".x_axis select option:eq(0)")
                    expect(selected.attr("selected")).toBe("selected");
                })


                it("pre-selects the second column in the Y axis box select", function() {
                    var selected = this.view.$(".y_axis select option:eq(1)")
                    expect(selected.attr("selected")).toBe("selected");
                })

                it("pre-selected the first option before styleSelect is called", function() {
                    var selected = this.view.$(".y_axis select option:eq(1)")
                    expect(this.styledSelected).toBe(selected.text());
                })
            })

            itBehavesLike.TabularDataVisualizationSidebarRangeChooser('.limiter.x_axis');
            itBehavesLike.TabularDataVisualizationSidebarRangeChooser('.limiter.y_axis');

            describe("#chartOptions", function() {
                it("should return all the chart options for a heatmap", function() {
                    var options = this.view.chartOptions();
                    expect(options.name).toBe("Foo");
                    expect(options.type).toBe("heatmap");
                    expect(options.xAxis).toBe("Rotten Eggs");
                    expect(options.yAxis).toBe("Zesty Eggs");
                    expect(options.xBins).toBe("20");
                    expect(options.yBins).toBe("20");
                })
            });
        })

        context("with no columns", function() {
            beforeEach(function() {
                this.columns = new chorus.collections.DatabaseColumnSet();
                this.view = new chorus.views.TabularDataVisualizationHeatmapSidebar({model: this.model, collection: this.columns})
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