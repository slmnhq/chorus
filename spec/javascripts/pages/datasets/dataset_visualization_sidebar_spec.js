describe("chorus.views.DatasetVisualizationSidebar", function() {
    beforeEach(function() {
        this.columns = fixtures.databaseColumnSet();
        this.view = new chorus.views.DatasetVisualizationSidebar({collection: this.columns})
    })

    describe("#render", function() {
        beforeEach(function() {
            spyOn(chorus, 'styleSelect');
            this.view.render();
        })

        describe("value select box", function() {
            it("has the right label", function() {
                expect(this.view.$(".value label").text()).toMatchTranslation("dataset.visualization.sidebar.value")
            });

            it("populates the select box", function() {
                expect(this.view.$(".value select option").length).toBe(this.columns.models.length);
            })

            it("is styled", function() {
                expect(chorus.styleSelect).toHaveBeenCalled()
            })
        })

        describe("category select box", function() {
            it("has the right label", function() {
                expect(this.view.$(".category label").text()).toMatchTranslation("dataset.visualization.sidebar.category")
            });

            it("populates the select box", function() {
                expect(this.view.$(".category select option").length).toBe(this.columns.models.length);
            })
        })

        describe("'create chart' button", function() {
            it("should have the right caption", function() {
                expect(this.view.$("button.create").text()).toMatchTranslation("dataset.visualization.sidebar.create_chart")
            })
        })
    })
})