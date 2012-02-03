describe("chorus.views.DatasetVisualizationTimeSeriesSidebar", function() {
    describe("#render", function() {
        context("with valid column data", function() {
            beforeEach(function() {
                this.columns = fixtures.databaseColumnSet();
                this.columns.add(fixtures.databaseColumn({typeCategory: 'SmellyThings'}));
                this.view = new chorus.views.DatasetVisualizationTimeSeriesSidebar({collection: this.columns})
                this.view.render();
            })

            describe("input select boxes", function() {
                it("populates the Value box with numeric columns", function() {
                    expect(this.view.$(".value select option").length).toBe(this.view.numericColumns().length);
                    expect(this.view.$(".value .labels").text()).toContainTranslation("dataset.visualization.sidebar.value")
                })
                it("populates the Time box with date/time columns", function() {
                    expect(this.view.$(".time select option").length).toBe(this.view.datetimeColumns().length);
                    expect(this.view.$(".time .labels").text()).toContainTranslation("dataset.visualization.sidebar.time")
                })
            })
        })

        context("with no columns", function() {
            beforeEach(function() {
                this.columns = new chorus.collections.DatabaseColumnSet();
                this.view = new chorus.views.DatasetVisualizationTimeSeriesSidebar({collection: this.columns})
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
        })
    })
})