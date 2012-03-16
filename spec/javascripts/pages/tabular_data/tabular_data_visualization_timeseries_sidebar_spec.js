describe("chorus.views.TabularDataVisualizationTimeSeriesSidebar", function() {
    describe("#render", function() {
        context("with valid column data", function() {
            beforeEach(function() {
                this.column1 = fixtures.databaseColumn({typeCategory: 'REAL_NUMBER', name: "Sandwich"});
                this.column2 = fixtures.databaseColumn({typeCategory: 'TIME', name: "Stopwatch"});
                this.column3 = fixtures.databaseColumn({typeCategory: 'FOO', name: "A Foo"});
                this.columns = fixtures.databaseColumnSet([this.column1, this.column2, this.column3]);

                this.model = fixtures.datasetChorusView({objectName: "Foo"});
                this.view = new chorus.views.TabularDataVisualizationTimeSeriesSidebar({model: this.model, collection: this.columns})
                this.view.render();
            })

            describe("input select boxes", function() {
                it("populates the Value box with numeric columns", function() {
                    expect(this.view.$(".value select option").length).toBe(this.view.numericColumnNames().length);
                    expect(this.view.$(".value .labels").text()).toContainTranslation("dataset.visualization.sidebar.value")
                })
                it("populates the Time box with date/time columns", function() {
                    expect(this.view.$(".time select option").length).toBe(this.view.datetimeColumnNames().length);
                    expect(this.view.$(".time .labels").text()).toContainTranslation("dataset.visualization.sidebar.time")
                })

                itBehavesLike.TabularDataVisualizationSidebarChooser(2, "maximum", ".value .limiter");
                itBehavesLike.TabularDataVisualizationSidebarChooser(2, "day", ".time .limiter");
            })

            describe("#chartOptions", function() {
                it("should return all the chart options for a timeseries", function() {
                    var options = this.view.chartOptions();
                    expect(options.name).toBe("Foo");
                    expect(options.type).toBe("timeseries");
                    expect(options.yAxis).toBe("Sandwich");
                    expect(options.xAxis).toBe("Stopwatch");
                    expect(options.aggregation).toBe("sum");
                    expect(options.timeInterval).toBe("minute");
                    expect(options.timeType).toBe("time");
                })
            });
        })

        context("with no columns", function() {
            beforeEach(function() {
                this.columns = new chorus.collections.DatabaseColumnSet();
                this.view = new chorus.views.TabularDataVisualizationTimeSeriesSidebar({model: this.model, collection: this.columns})
                this.view.render();
            })

            it("should display 'No numerical columns' instead of the numerical column selector for value", function() {
                expect(this.view.$(".value select option")).not.toExist()
                expect(this.view.$(".value .no_columns").text()).toContainTranslation("dataset.visualization.sidebar.no_numerical_columns")
            })

            it("should display 'No time columns' instead of the numerical column selector for time", function() {
                expect(this.view.$(".time select option")).not.toExist()
                expect(this.view.$(".time .no_columns").text()).toContainTranslation("dataset.visualization.sidebar.no_datetime_columns")
            })

            it("should disable the button", function() {
                expect(this.view.$("button.create")).toBeDisabled();
            });
        })

        context("with half of the columns", function() {
            beforeEach(function() {
                this.column1 = fixtures.databaseColumn({typeCategory: 'REAL_NUMBER', name: "Sandwich"});
                this.columns = new chorus.collections.DatabaseColumnSet([this.column1]);
                this.view = new chorus.views.TabularDataVisualizationTimeSeriesSidebar({model: this.model, collection: this.columns})
                this.view.render();
            });

            it("should disable the button", function() {
                expect(this.view.$("button.create")).toBeDisabled();
            });
        });
    })
})