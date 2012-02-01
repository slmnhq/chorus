describe("chorus.views.DatasetFilterWizard", function() {
    beforeEach(function () {
        this.collection = fixtures.databaseColumnSet();
        this.view = new chorus.views.DatasetFilterWizard({collection: this.collection});
    });

    describe("#render", function() {
        beforeEach(function () {
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

        describe("clicking the add filter link", function() {
            beforeEach(function () {
                this.view.$("a.add_filter").click();
            });

            it("adds another filter", function() {
                expect(this.view.$("li.dataset_filter").length).toBe(2);
            });

            it("adds the last class to the new filter and removes it from the old", function() {
                expect(this.view.$("li.dataset_filter:eq(0)")).not.toHaveClass("last");
                expect(this.view.$("li.dataset_filter:eq(1)")).toHaveClass("last");
            });

            describe("removing the filter", function() {
                beforeEach(function () {
                    this.oldView = this.view.filterViews[1];
                    this.view.$(".remove:eq(1)").click();
                });

                it("removes the filterView from the DOM", function() {
                    expect(this.view.$("li.dataset_filter").length).toBe(1);
                });

                it("adds the 'last' class to the only li", function() {
                    expect(this.view.$("li.dataset_filter")).toHaveClass("last");
                });

                it("removes the filterView from the view's filterViews collection", function() {
                    expect(this.view.filterViews.length).toBe(1);
                    expect(this.view.filterViews[0]).not.toBe(this.oldView);
                });
            });
        });
    });
});