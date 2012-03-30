describe("chorus.views.DatasetAndColumnList", function() {
    beforeEach(function() {
        this.dataset = fixtures.datasetChorusView();
        this.view = new chorus.views.DatasetAndColumnList({ model: this.dataset.schema() });
        this.view.render();
        this.view.$(".database_dataset_list input.search").val("searching for a table...");
    });

    it("shows the dataset list view", function() {
        expect(this.view.$(".database_dataset_list")).not.toHaveClass("hidden");
    });

    it("hides the column list view", function() {
        expect(this.view.$(".database_column_list")).toHaveClass("hidden");
    });

    it("creates a dataset list and a column list with the right schema", function() {
        expect(this.view.datasetList).toBeA(chorus.views.DatabaseDatasetSidebarList);
        expect(this.view.columnList).toBeA(chorus.views.DatabaseColumnSidebarList);
        expect(this.view.datasetList.schema).toBe(this.dataset.schema());
        expect(this.view.columnList.schema).toBe(this.dataset.schema());
    });

    context("when a table is selected in the dataset list", function() {
        beforeEach(function() {
            this.table = fixtures.databaseTable();
            spyOnEvent(this.view.columnList, 'datasetSelected');
            this.view.datasetList.trigger("datasetSelected", this.table);
            this.server.completeAllFetches();
            this.view.$(".database_column_list input.search").val("searching for a column...");
        });

        it("hides the dataset list", function() {
            expect(this.view.$(".database_dataset_list")).toHaveClass("hidden");
        });

        it("shows the column list", function() {
            expect(this.view.$(".database_column_list")).not.toHaveClass("hidden");
        });

        it("forwards the selection event to the column list view", function() {
            expect("datasetSelected").toHaveBeenTriggeredOn(this.view.columnList, [ this.table ]);
        });

        context("when the back link is clicked", function() {
            beforeEach(function() {
                this.view.columnList.trigger("back");
            });

            it("clears the search text", function() {
                expect(this.view.$(".database_dataset_list input.search").val()).toBe("");
            });

            it("should hide the column list", function() {
                expect(this.view.$(".database_column_list")).toHaveClass("hidden");
            });

            it("should show the dataset list", function() {
                expect(this.view.$(".database_dataset_list")).not.toHaveClass("hidden");
            });

            describe("clicking a table again", function() {
                beforeEach(function() {
                    this.view.$(".database_dataset_list li").click();
                    this.server.completeAllFetches();
                });

                it("clears the search text for the columns", function() {
                    expect(this.view.$(".database_column_list input.search").val()).toBe("");
                });
            });
        });
    });
});
