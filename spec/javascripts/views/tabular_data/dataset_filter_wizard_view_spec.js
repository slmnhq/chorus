describe("chorus.views.DatasetFilterWizard", function() {
    beforeEach(function() {
        this.dataset = newFixtures.datasetSandboxTable();
        this.columnSet = this.dataset.columns().reset([fixtures.databaseColumn(), fixtures.databaseColumn()]);
        this.view = new chorus.views.DatasetFilterWizard({columnSet: this.columnSet});
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("displays the filter title", function() {
            expect(this.view.$("h1.filter_title").text()).toMatchTranslation("dataset.filter.title");
        });

        it("displays one filter when rendered at first", function() {
            expect(this.view.$("li.dataset_filter").length).toBe(1);
        });

        it("adds the 'last' class to the only li", function() {
            expect(this.view.$("li.dataset_filter")).toHaveClass("last");
        });

        describe("#filterCount", function() {
            beforeEach(function() {
                this.view.addFilter();
                this.view.addFilter();
                spyOn(this.view.collection.at(0), "sqlString").andReturn("foo = 2");
                spyOn(this.view.collection.at(1), "sqlString").andReturn("");
                spyOn(this.view.collection.at(2), "sqlString").andReturn("foo = 4");
            });

            it("eliminates empty filters", function() {
                expect(this.view.filterCount()).toBe(2);
            });
        });

        describe("clicking the add filter link", function() {
            beforeEach(function() {
                this.view.$("a.add_filter").click();
            });

            it("adds another filter", function() {
                expect(this.view.$("li.dataset_filter").length).toBe(2);
            });

            it("adds the last class to the new filter and removes it from the old", function() {
                expect(this.view.$("li.dataset_filter:eq(0)")).not.toHaveClass("last");
                expect(this.view.$("li.dataset_filter:eq(1)")).toHaveClass("last");
            });

            describe("resetting the wizard", function() {
                it("resets back to the default filter", function() {
                    this.view.resetFilters();
                    expect(this.view.$('li.dataset_filter').length).toBe(1);
                })
            });

            describe("removing the filter", function() {
                beforeEach(function() {
                    this.view.$(".remove:eq(1)").click();
                });

                it("removes the filterView from the DOM", function() {
                    expect(this.view.$("li.dataset_filter").length).toBe(1);
                });

                it("adds the 'last' class to the only li", function() {
                    expect(this.view.$("li.dataset_filter")).toHaveClass("last");
                });
            });
        });

        describe("when a filter is deleted", function() {
            beforeEach(function() {
                this.view.addFilter();
                this.view.addFilter();
                this.view.$(".remove").eq(0).click();
            });

            it("removes the view for filter", function() {
                expect(this.view.collection.length).toBe(2);
                expect(this.view.$(".dataset_filter").length).toBe(2);
            });
        });
    });

    describe("#removeInvalidFilters", function() {
        beforeEach(function() {
            this.view.render();
            this.view.collection.at(0).set({column : this.columnSet.at(1)});
            this.view.addFilter();
            this.selectedColumn = this.columnSet.at(0);
            this.view.collection.at(1).set({column : this.selectedColumn});
            this.columnSet.remove(this.selectedColumn);
        });

        it("removes the invalid filter", function() {
            expect(this.view.$('.dataset_filter').length).toBe(1);
            expect(this.view.$('.column_filter select').get(0).selectedIndex).toBe(0);
        });
    });
});
