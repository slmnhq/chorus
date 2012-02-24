describe("chorus.dialogs.DatasetsAttach", function() {
    beforeEach(function() {
        this.datasets = new chorus.collections.DatasetSet([fixtures.datasetSandboxTable(), fixtures.datasetSandboxTable()]);
        this.dialog = new chorus.dialogs.DatasetsAttach({ workspaceId : "33" });
        this.server.completeFetchAllFor(this.dialog.collection, this.datasets.models);
        this.dialog.render();
    });

    it("has the correct submit button text", function() {
        expect(this.dialog.$('button.submit')).toContainTranslation("actions.dataset_attach")
    });

    it("has the correct iconUlr", function() {
        expect(this.dialog.$('.collection_list img:eq(0)')).toHaveAttr('src', this.datasets.at(0).iconUrl({size: 'small'}));
    });

    it("has the correct name", function() {
        expect(this.dialog.$('.name:eq(0)')).toContainText(this.datasets.at(0).get("objectName"));
    });

});
