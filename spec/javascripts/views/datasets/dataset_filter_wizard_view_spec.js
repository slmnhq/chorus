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
            expect(this.view.$("li.filter").length).toBe(1);
        });

        describe("clicking the add filter link", function() {
            beforeEach(function () {
                this.view.$("a.add_filter").click();
            });

            it("adds another filter", function() {
                expect(this.view.$("li.filter").length).toBe(2);
            });
        });
    });
});