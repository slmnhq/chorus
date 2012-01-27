describe("chorus.views.DatasetContentDetails", function() {
    describe("#render", function() {
        beforeEach(function() {
            this.collection = fixtures.databaseColumnSet();
            this.view = new chorus.views.DatasetContentDetails({collection: this.collection});
            this.view.render();
        });

        it("renders the definition bar", function() {
            expect(this.view.$(".definition")).toExist();
        })

        it("renders the column count bar", function() {
            expect(this.view.$(".column_count")).toExist();
        })

        it("renders the column count in the column count bar", function() {
            expect(this.view.$(".column_count .count").text().trim()).toMatchTranslation("dataset.column_count", { count : this.collection.models.length })
        })
    })
});
