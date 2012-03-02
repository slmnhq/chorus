describe("chorus.views.TabularDataVisualizationHistogramSidebar", function() {
    describe("#render", function() {
        context("with valid column data", function() {
            beforeEach(function() {
                this.columns = fixtures.databaseColumnSet();
                this.columns.add(fixtures.databaseColumn({typeCategory: 'SmellyThings'}));
                this.view = new chorus.views.TabularDataVisualizationHistogramSidebar({collection: this.columns})
                this.view.render();
            })

            describe("category select box", function() {
                it("populates the select box with numeric columns", function() {
                    expect(this.view.$(".category select option").length).toBe(this.view.numericColumnNames().length);
                })
            })

            it("has # of bins", function() {
                expect(this.view.$('.limiter')).toContainTranslation('dataset.visualization.sidebar.number_of_bins');
            })
            itBehavesLike.TabularDataVisualizationSidebarRangeChooser();
        })

        context("with no columns", function() {
            beforeEach(function() {
                this.columns = new chorus.collections.DatabaseColumnSet();
                this.view = new chorus.views.TabularDataVisualizationHistogramSidebar({collection: this.columns})
                this.view.render();
            })

            it("should display 'No columns' instead of the categorical column selector", function() {
                expect(this.view.$(".category select option")).not.toExist()
                expect(this.view.$(".no_columns").text()).toContainTranslation("dataset.visualization.sidebar.no_columns")
            })
        })
    })
})