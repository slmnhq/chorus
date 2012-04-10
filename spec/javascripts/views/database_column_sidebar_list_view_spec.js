describe("chorus.views.DatabaseColumnSidebarList", function() {
    describe("initialization", function() {
        context("when there is no sandbox", function() {
            beforeEach(function() {
                this.view = new chorus.views.DatabaseColumnSidebarList({ sandbox: undefined })
            })

            it("should not crash", function() {
                expect(this.view).toBeDefined()
            })
        })
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view = new chorus.views.DatabaseColumnSidebarList({ sandbox: fixtures.sandbox() });
            this.view.render();
        });

        it("should show a loading spinner", function() {
            expect(this.view.$(".loading_section")).toExist();
        });

        describe("when rendered with a databaseView", function() {
            beforeEach(function() {
                this.databaseView = fixtures.databaseView({ objectName: "brian_the_view", schemaName: "john_the_schema" });
                this.view.trigger("datasetSelected", this.databaseView);
                this.server.completeFetchAllFor(this.databaseView.columns(), [fixtures.databaseColumn()]);
            });

            it("renders successfully", function() {
                expect(this.view.$('li')).toExist();
            });
        })

        describe("when rendered with a chorus view", function() {
            var chorusView;
            beforeEach(function() {
                chorusView = fixtures.datasetChorusView({ objectName: "tobias_the_chorus_view" });
                this.view.trigger("datasetSelected", chorusView);
                this.server.completeFetchAllFor(chorusView.columns(), [fixtures.databaseColumn()]);
            });

            it("renders successfully", function() {
                expect(this.view.$("li")).toExist();
            });
        });

        describe("when the 'datasetSelected' event is triggered", function() {
            beforeEach(function() {
                this.table = fixtures.databaseTable({ objectName: "brian_the_table", schemaName: "john_the_schema" });
                this.view.trigger("datasetSelected", this.table);
            });

            it("should fetch the columns for the table", function() {
                expect(this.server.lastFetchFor(this.table.columns(), {page: 1, rows: 1000})).not.toBeUndefined();
            });

            context("when the fetch completes", function() {
                context("when there are no columns", function() {
                    beforeEach(function() {
                        this.server.completeFetchAllFor(this.table.columns(), []);
                    });

                    it("should show the 'no columns found' message", function() {
                        expect(this.view.$(".none_found")).toContainTranslation("schema.column.list.empty");
                    });
                });

                context("when there are columns", function() {
                    beforeEach(function() {
                        this.server.completeFetchAllFor(this.table.columns(), [
                            fixtures.databaseColumn({name: "column_1"}),
                            fixtures.databaseColumn({name: "column_2"})
                        ]);
                    });
                    jasmine.sharedExamples.DatabaseSidebarList();

                    it("should show a 'back to all datasets' link", function() {
                        expect(this.view.$("a.back").text()).toMatchTranslation("schema.column.list.back");
                    });

                    it("shows the table name next to the schema name", function() {
                        $("#jasmine_content").append(this.view.el);
                        expect(this.view.$(".context .schema")).toHaveText("john_the_schema");
                        expect(this.view.$(".context .schema")).toHaveAttr("title", "john_the_schema");

                        expect(this.view.$(".context .table")).toHaveText("brian_the_table");
                        expect(this.view.$(".context .table")).toHaveAttr("title", "brian_the_table");
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

                    describe("when switching to another dataset", function() {
                        beforeEach(function() {
                            var table1 = fixtures.databaseTable({
                                objectName: "jack_the_table",
                                schemaName: "harry_the_schema"
                            });

                            this.view.trigger("datasetSelected", table1);

                            this.server.completeFetchAllFor(table1.columns(), [
                                fixtures.databaseColumn({name: "column_a"}),
                                fixtures.databaseColumn({name: "column_b"}),
                                fixtures.databaseColumn({name: "column_c"})
                            ]);
                        });

                        it("re-fetches the correct columns", function() {
                            expect(this.view.$("li").length).toBe(3);
                        });

                        describe("when switching back to the first dataset", function() {
                            beforeEach(function() {
                                this.view.trigger("datasetSelected", this.table);
                                this.server.completeFetchAllFor(this.table.columns(), [
                                    fixtures.databaseColumn({name: "column_1"}),
                                    fixtures.databaseColumn({name: "column_2"})
                                ]);
                            });

                            it("has the correct columns", function() {
                                expect(this.view.$("li").length).toBe(2);
                            });
                        });
                    });
                });
            });
        });
    });
});
