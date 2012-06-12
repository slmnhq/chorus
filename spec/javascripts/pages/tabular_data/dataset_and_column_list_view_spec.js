describe("chorus.views.DatasetAndColumnList", function() {
    beforeEach(function() {
        chorus.page = { workspace: rspecFixtures.workspace() };
        this.dataset = newFixtures.dataset.chorusView();
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
        expect(this.view.datasetList.schema.name()).toBe(this.dataset.schema().name());
        expect(this.view.columnList.schema.name()).toBe(this.dataset.schema().name());
    });

    context("when a table is selected in the dataset list", function() {
        beforeEach(function() {
            this.table = rspecFixtures.databaseObject();
            chorus.PageEvents.broadcast("datasetSelected", this.table);
            this.server.completeAllFetches();
            this.view.$(".database_column_list input.search").val("searching for a column...");
        });

        it("hides the dataset list", function() {
            expect(this.view.$(".database_dataset_list")).toHaveClass("hidden");
        });

        it("shows the column list", function() {
            expect(this.view.$(".database_column_list")).not.toHaveClass("hidden");
        });

        context("when the back link is clicked", function() {
            beforeEach(function() {
                spyOn(chorus.PageEvents, "broadcast");
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

            it("should broadcast a dataset:back", function() {
                expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("dataset:back");
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
