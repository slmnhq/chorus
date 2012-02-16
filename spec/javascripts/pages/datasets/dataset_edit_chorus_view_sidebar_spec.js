describe("chorus.views.DatasetEditChorusViewSidebar", function() {
    beforeEach(function() {
        this.dataset = fixtures.datasetChorusView();
        this.sandbox = fixtures.sandbox();
        this.view = new chorus.views.DatasetEditChorusViewSidebar({model: this.dataset, sandbox: this.sandbox});
        this.server.completeAllFetches();
    });

    describe("initialization", function() {
        it("has a SidebarActivityListView", function() {
            expect(this.view.activityList).toBeDefined();
        })
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.model.fetch();
            this.server.completeFetchFor(this.dataset);
            this.view.render();
        });

        it("displays the chorus view name", function() {
            expect(this.view.$(".name").text()).toBe(this.dataset.get("objectName"));
        });

        it("should have an activities tab", function() {
            expect(this.view.$('.tab_control .activity_list')).toExist();
        });

        it("should have a functions tab", function() {
            expect(this.view.$('.tab_control .database_function_list')).toExist();
        });

        it("should have a dataset tab", function() {
            expect(this.view.$('.tab_control .datasets_and_columns')).toExist();
        });

        it("renders the functions subview", function() {
            expect(this.view.functionList).toBeA(chorus.views.DatabaseFunctionSidebarList);
        });

        context("when the dataset tab is selected", function() {
            beforeEach(function() {
                this.view.$(".tab_control .database_dataset_list").click();
                this.server.completeAllFetches();
                this.view.$(".database_dataset_list input.search").val("searching for a table...");
            });

            it("shows the dataset list view", function() {
                expect(this.view.$(".database_dataset_list")).not.toHaveClass("hidden");
            });

            it("hides the column list view", function() {
                expect(this.view.$(".database_column_list")).toHaveClass("hidden");
            });

            context("when a table is selected in the dataset list", function() {
                beforeEach(function() {
                    this.table = fixtures.databaseTable();
                    spyOnEvent(this.view.columnList, 'datasetSelected');
                    this.view.datasetList.trigger("datasetSelected", this.table);
                    this.server.completeAllFetches();
                    this.view.$(".database_column_list input.search").val("searching for a column...");
                });

                it("hides the metadata list", function() {
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
                            this.view.$(".tab_control .database_dataset_list").click();
                            this.server.completeAllFetches();
                        });

                        it("clears the search text for the columns", function() {
                            expect(this.view.$(".database_column_list input.search").val()).toBe("");
                        });
                    });
                });
            });
        });

    });
});