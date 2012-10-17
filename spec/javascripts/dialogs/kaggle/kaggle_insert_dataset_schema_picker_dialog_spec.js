describe("chorus.dialogs.KaggleInsertDatasetSchemaPicker", function() {
    var dialog, datasets, datasetModels;
    beforeEach(function() {
        stubModals();
        dialog = new chorus.dialogs.KaggleInsertDatasetSchema({ workspaceId : "33" });
        datasets = new chorus.collections.WorkspaceDatasetSet([], {workspaceId: "33" });
        datasetModels = [
                            newFixtures.workspaceDataset.sandboxTable({ objectName: "A", columns: 42, id: "REAL_ID" }),
                            newFixtures.workspaceDataset.chorusView({ objectName: "B", columns: 666, id: "AGENT_SMITH" })
                        ];
    });

    describe("#render", function() {
        var options;
        beforeEach(function() {
            options = { order: "objectName" };
            dialog.launchModal();
        });

        it("fetches the results sorted by objectName", function() {
            var url = this.server.lastFetch().url;
            var urlParams = _.extend({}, options);
            urlParams.order = "object_name";
            expect(url).toHaveUrlPath("/workspaces/33/datasets");
            expect(url).toContainQueryParams(urlParams);
        });

        describe("when the fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchFor(datasets, datasetModels, options);
                spyOn(chorus.dialogs.PreviewColumns.prototype, 'render').andCallThrough();
            });

            it("shows the correct title", function() {
                expect(dialog.$("h1")).toContainTranslation("kaggle.pick_datasets");
            });

            it("shows the correct search help", function() {
                expect(dialog.$("input.chorus_search").attr("placeholder")).toMatchTranslation("dataset.dialog.search_table");
            });

            it("shows the correct button name", function() {
                expect(dialog.$("button.submit")).toContainTranslation("kaggle.datasets_select");
            });

            it("has multiSelection", function() {
                expect(dialog.multiSelection).toBeTruthy();
            });

            it("shows all associated datasets", function() {
                expect(_.pluck(dialog.collection.models, "objectName")).toEqual(_.pluck(datasetModels, "objectName"));
            });
        });
    });
});
