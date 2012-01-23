describe("chorus.views.SchemaColumnListView", function() {
    beforeEach(function() {
        this.view = new chorus.views.SchemaColumnListView({ sandbox: fixtures.sandbox() });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("should show a loading spinner", function() {
            expect(this.view.$(".loading_section")).toExist();
        });

        it("should fetch the table's columns", function() {
            expect(this.server.lastFetchFor(this.clickedTable)).not.toBeUndefined();
        });

        context("when the fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.clickedTable.columns(), [
                    fixtures.databaseColumn({name: "column_1"}),
                    fixtures.databaseColumn({name: "column_2"})
                ]);
            });

            it("should show the column list for the selected item", function() {
                expect(this.view.$(".columns")).not.toHaveClass("hidden");
            });

            it("should show an 'li' for each column", function() {
                expect(this.view.$("li").length).toBe(2);
                expect(this.view.$("li").eq(0)).toContainText("column_1");
                expect(this.view.$("li").eq(1)).toContainText("column_2");
            });
        });
    });
});
