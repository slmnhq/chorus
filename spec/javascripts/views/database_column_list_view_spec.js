describe("chorus.views.DatabaseColumnList", function() {
    describe("#render", function() {
        beforeEach(function() {
            this.collection = fixtures.databaseColumnSet([], { name : "column_name", comment : "column comment", typeCategory: "WHOLE_NUMBER" });
            this.view = new chorus.views.DatabaseColumnList({collection: this.collection});
            this.view.render();
        });

        it("renders an item for each column", function() {
            expect(this.view.$("> li").length).toBe(this.collection.length);
        });

        it("shows the name of each column", function() {
            expect(this.view.$("li:eq(0) .name")).toHaveText("column_name");
        })

        it("shows the comment for each column", function() {
            expect(this.view.$("li:eq(0) .summary")).toHaveText("column comment");
        })

        it("shows the type for each column", function() {
            expect(this.view.$("li:eq(0) .type").text().trim()).toMatchTranslation("data_types.numeric")
            expect(this.view.$("li:eq(0) .type")).toHaveClass("numeric")
        })
        
        describe("clicking on a list item", function() {
            beforeEach(function() {
                expect(this.view.$("li:eq(0)")).toHaveClass("selected");
                this.view.$("li:eq(1)").click()
            })

            it("moves the selected class", function() {
                expect(this.view.$("li:eq(0)")).not.toHaveClass("selected");
                expect(this.view.$("li:eq(1)")).toHaveClass("selected");
            })
        })
    });
});