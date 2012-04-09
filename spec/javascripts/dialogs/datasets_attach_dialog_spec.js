describe("chorus.dialogs.DatasetsAttach", function() {
    beforeEach(function() {
        this.datasets = new chorus.collections.DatasetSet([
            fixtures.datasetSandboxTable(),
            fixtures.datasetSandboxTable()
        ]);
        this.dialog = new chorus.dialogs.DatasetsAttach([], { workspaceId : "33" });
        this.dialog.render();
    });

    it("fetches the first page of datasets", function() {
        expect(this.datasets).toHaveBeenFetched();
    });

    describe("when the fetch completes", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.datasets, this.datasets.models, { records: 2, total: 5 });
        });

        it("only fetches one page initially", function() {
            expect(this.server.requests.length).toBe(1);
        });

        it("shows the pagination controls", function() {
            expect(this.dialog.$("a.next")).not.toHaveClass("hidden");
        });

        it("has the correct submit button text", function() {
            expect(this.dialog.$('button.submit')).toContainTranslation("actions.dataset_attach")
        });

        it("has the correct iconUlr", function() {
            expect(this.dialog.$('li:eq(0) img')).toHaveAttr('src', this.datasets.at(0).iconUrl({size: 'medium'}));
        });

        it("has the correct name", function() {
            expect(this.dialog.$('li:eq(0) .name')).toContainText(this.datasets.at(0).get("objectName"));
        });

        it("has the correct search placeholder text", function() {
            expect(this.dialog.$("input").attr("placeholder")).toMatchTranslation("dataset.dialog.search");
        });
    });
});
