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
                it("populates the X axis box with numeric columns", function() {
                    expect(this.view.$(".x_axis select option").length).toBe(this.view.numericColumns().length);
                })
                it("populates the Y axis box with numeric columns", function() {
                    expect(this.view.$(".y_axis select option").length).toBe(this.view.numericColumns().length);
                })
            })

            itBehavesLike.DatasetVisualizationSidebarLimiter('.limiter.x_axis');
            itBehavesLike.DatasetVisualizationSidebarLimiter('.limiter.y_axis');
        })

        context("with no columns", function() {
            beforeEach(function() {
                this.columns = new chorus.collections.DatabaseColumnSet();
                this.view = new chorus.views.DatasetVisualizationTimeSeriesSidebar({collection: this.columns})
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