describe("chorus.views.DatasetEditChorusViewSidebar", function() {
    beforeEach(function() {
        chorus.page = { workspace: newFixtures.workspace() };
        this.dataset = fixtures.datasetChorusView();
        this.view = new chorus.views.DatasetEditChorusViewSidebar({model: this.dataset });
        this.server.completeAllFetches();
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
            expect(this.view.tabs.activity).toBeA(chorus.views.ActivityList);
        });

        it("should have a functions tab", function() {
            expect(this.view.$('.tab_control .database_function_sidebar_list')).toExist();
            expect(this.view.tabs.database_function_list).toBeA(chorus.views.DatabaseFunctionSidebarList);
        });

        it("should have a dataset tab", function() {
            expect(this.view.$('.tab_control .dataset_and_column_list')).toExist();
            expect(this.view.tabs.datasets_and_columns).toBeA(chorus.views.DatasetAndColumnList);
        });
    });
});
