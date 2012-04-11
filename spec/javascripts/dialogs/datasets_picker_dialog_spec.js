describe("chorus.dialogs.DatasetsPicker", function() {
    var dialog, datasets;
    beforeEach(function() {
        stubModals();
        dialog = new chorus.dialogs.DatasetsPicker({ workspaceId : "33" });
        datasets = new chorus.collections.DatasetSet([
            fixtures.datasetSandboxTable(),
            fixtures.datasetSandboxTable()
        ], {workspaceId: "33", type: "SANDBOX_TABLE", objectType: "BASE_TABLE" });
    });

    describe("#render", function() {
        var options;
        beforeEach(function() {
            options = { sidx: "objectName", sord: "asc", type: "SANDBOX_TABLE", objectType: "BASE_TABLE" };
            dialog.launchModal();
        });

        it("fetches the results sorted by objectName", function() {
            var url = this.server.lastFetch().url
            expect(url).toHaveUrlPath("/edc/workspace/33/dataset");
            expect(url).toContainQueryParams(options);
        });

        describe("when the fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchFor(datasets, datasets.models, options);
            });

            it("shows the correct title", function() {
                expect(dialog.$("h1")).toContainTranslation("dataset.pick");
            });

            it("shows the correct search help", function() {
                expect(dialog.$("input.chorus_search").attr("placeholder")).toMatchTranslation("dataset.dialog.search_table");
            });

            it("shows the correct item count label", function() {
                expect(dialog.$(".count")).toContainTranslation("entity.name.Table", { count: 2 });
            });

            it("shows the correct button name", function() {
                expect(dialog.$("button.submit")).toContainTranslation("actions.dataset_select");
            });

            it("doesn't have multiSelection", function() {
                expect(dialog.multiSelection).toBeFalsy();
            });

            xit("is pre-populated with the previously scheduled table")

            it("only shows real sandbox tables (no hdfs, source, externals, views)", function() {
                _.each(dialog.collection.models, function(model) {
                    expect(model.get("type")).toBe("SANDBOX_TABLE");
                });
            });
        });
    });
});