describe("chorus.views.SchemaColumnList", function() {
    beforeEach(function() {
        this.view = new chorus.views.SchemaColumnList({ sandbox: fixtures.sandbox() });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("should show a loading spinner", function() {
            expect(this.view.$(".loading_section")).toExist();
        });

        describe("when the 'datasetSelected' event is triggered", function() {
            beforeEach(function() {
                this.table = fixtures.databaseTable();
                this.view.trigger("datasetSelected", this.table);
            });

            it("should fetch the columns for the table", function() {
                expect(this.server.lastFetchFor(this.table.columns())).not.toBeUndefined();
            });

            context("when the fetch completes", function() {
                context("when there are no columns", function() {
                    beforeEach(function() {
                        this.server.completeFetchFor(this.table.columns(), []);
                    });
                    
                    it("should show the 'no columns found' message", function() {
                        expect(this.view.$(".none_found")).toContainTranslation("schema.column.list.empty");
                    });
                });

                context("when there are columns", function() {
                    beforeEach(function() {
                        this.server.completeFetchFor(this.table.columns(), [
                            fixtures.databaseColumn({name: "column_1"}),
                            fixtures.databaseColumn({name: "column_2"})
                        ]);
                    });

                    it("should show a 'back to all datasets' link", function() {
                        expect(this.view.$("a.back").text()).toMatchTranslation("schema.column.list.back");
                    });

                    it("should show an 'li' for each column", function() {
                        expect(this.view.$("li").length).toBe(2);
                        expect(this.view.$("li").eq(0)).toContainText("column_1");
                        expect(this.view.$("li").eq(1)).toContainText("column_2");
                    });

                    context("when the 'back to all datasets' link is clicked", function() {
                        beforeEach(function() {
                            spyOnEvent(this.view, "back");
                            this.view.$("a.back").click();
                        });

                        it("should trigger a 'back' event", function() {
                            expect("back").toHaveBeenTriggeredOn(this.view);
                        });
                    });
                });
            });
        });
    });
});
