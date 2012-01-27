describe("chorus.views.DatabaseColumnList", function() {
    describe("#render", function() {
        beforeEach(function() {
            this.collection = fixtures.databaseColumnSet([], { comment : "column comment", typeCategory: "WHOLE_NUMBER" });
            this.collection.at(0).set({ name : "column_name_2", ordinalPosition : "2" })
            this.collection.at(1).set({ name : "column_name_1", ordinalPosition : "1" })
            this.view = new chorus.views.DatabaseColumnList({collection: this.collection});
            this.view.render();
        });

        it("renders an item for each column", function() {
            expect(this.view.$("> li").length).toBe(this.collection.length);
        });

        it("shows the comment for each column", function() {
            expect(this.view.$("li:eq(0) .summary")).toHaveText("column comment");
        })

        it("shows the type for each column", function() {
            expect(this.view.$("li:eq(0) .type").text().trim()).toMatchTranslation("data_types.numeric")
            expect(this.view.$("li:eq(0) .type")).toHaveClass("numeric")
        })

        it("sorts the columns by ordinalPosition", function() {
            expect(this.view.$("li:eq(0) .name")).toHaveText("column_name_1")
            expect(this.view.$("li:eq(1) .name")).toHaveText("column_name_2")
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