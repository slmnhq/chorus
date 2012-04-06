describe("chorus.views.FrequencyChartConfiguration", function() {
    describe("#render", function() {
        context("with valid column data", function() {
            beforeEach(function() {
                this.column = fixtures.databaseColumn({typeCategory: "STRING", name: "Sandwich"});
                this.columns = fixtures.databaseColumnSet([this.column]);

                this.model = fixtures.datasetChorusView({objectName: "Foo"})
                this.view = new chorus.views.FrequencyChartConfiguration({collection: this.columns, model: this.model})
                this.view.render();
                this.view.$(".limiter .selected_value").text("3")
            })

            describe("category select box", function() {
                it("populates the select box with all columns", function() {
                    expect(this.view.$(".category select option").length).toBe(this.columns.models.length);
                })
            })
            itBehavesLike.ChartConfigurationRangeChooser();

            describe("#chartOptions", function() {
                it("should return all the chart options for a frequency plot", function() {
                    var options = this.view.chartOptions();
                    expect(options.name).toBe("Foo");
                    expect(options.type).toBe("frequency");
                    expect(options.yAxis).toBe("Sandwich");
                    expect(options.bins).toBe("3");
                })
            })
        })

        context("with no columns", function() {
            beforeEach(function() {
                this.columns = new chorus.collections.DatabaseColumnSet();
                this.view = new chorus.views.FrequencyChartConfiguration({collection: this.columns})
                this.view.render();
            })

            it("should display 'No columns' instead of the categorical column selector", function() {
                expect(this.view.$(".category select option")).not.toExist()
                expect(this.view.$(".no_columns").text()).toContainTranslation("dataset.visualization.sidebar.no_columns.all")
            })

            it("should disable the button", function() {
                expect(this.view.$("button.create")).toBeDisabled();
            });
        })
    })
})
