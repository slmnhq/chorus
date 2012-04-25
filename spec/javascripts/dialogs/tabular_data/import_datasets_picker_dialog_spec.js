describe("chorus.dialogs.ImportDatasetsPicker", function() {
    var dialog, datasets;
    beforeEach(function() {
        stubModals();
        dialog = new chorus.dialogs.ImportDatasetsPicker({ workspaceId : "33" });
        datasets = new chorus.collections.DatasetSet([
            newFixtures.dataset.sandboxTable({ objectName: "A", columns: 42, id: "REAL_ID" }),
            newFixtures.dataset.sandboxTable({ objectName: "B", columns: 666, id: "AGENT_SMITH" })
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
            expect(url).toHaveUrlPath("/workspace/33/dataset");
            expect(url).toContainQueryParams(options);
        });

        describe("when the fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchFor(datasets, datasets.models, options);
                spyOn(chorus.dialogs.PreviewColumns.prototype, 'render').andCallThrough();
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

            it("has serverside search", function() {
                expect(dialog.serverSideSearch).toBeTruthy();
            });

            it("only shows real sandbox tables (no hdfs, source, externals, views)", function() {
                _.each(dialog.collection.models, function(model) {
                    expect(model.get("type")).toBe("SANDBOX_TABLE");
                });
            });

            it("shows a Preview Columns link for each dataset", function() {
                expect(dialog.$(".items li:eq(0) a.preview_columns")).toContainTranslation("dataset.manage_join_tables.preview_columns");
                expect(dialog.$(".items li:eq(1) a.preview_columns")).toContainTranslation("dataset.manage_join_tables.preview_columns");
            });

            it("has the correct id, not the CID", function() {
                expect(dialog.$(".items li:eq(0)").data("id")).toBe("REAL_ID");
                expect(dialog.$(".items li:eq(1)").data("id")).toBe("AGENT_SMITH");
            });

            it("shows the preview columns submodal with the appropriate dataset when you click the link", function() {
                dialog.$(".items li:eq(0) a.preview_columns").click();
                expect(chorus.dialogs.PreviewColumns.prototype.render).toHaveBeenCalled();
                var previewColumnsDialog = chorus.dialogs.PreviewColumns.prototype.render.mostRecentCall.object;
                expect(previewColumnsDialog.title).toBe(dialog.title);
                expect(previewColumnsDialog.model.get("id")).toEqual(datasets.at(0).get("id"));
            });

            it("shows the number of columns in each dataset", function() {
                expect(dialog.$(".items li:eq(0) .column_count")).toContainTranslation("dataset.column_count", {count: 42});
                expect(dialog.$(".items li:eq(1) .column_count")).toContainTranslation("dataset.column_count", {count: 666});
            });
        });

        context("when a dataset has no column count (or is undefined)", function() {
            beforeEach(function() {
                datasets = new chorus.collections.DatasetSet([
                    newFixtures.dataset.sandboxTable({ objectName: "A", columns: null, id: "NOBODY" }),
                    newFixtures.dataset.sandboxTable({ objectName: "B", columns: undefined, id: "NONE" })
                ], {workspaceId: "33", type: "SANDBOX_TABLE", objectType: "BASE_TABLE" });
                this.server.completeFetchFor(datasets, datasets.models, options);
            });

            it("doesn't show column count", function() {
                expect(dialog.$("li:eq(0) span.column_count")).not.toExist();
                expect(dialog.$("li:eq(1) span.column_count")).not.toExist();
            });
        });
    });
});