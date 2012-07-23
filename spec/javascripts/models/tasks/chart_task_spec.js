describe("chorus.models.ChartTask", function() {
    beforeEach(function() {
        this.dataset = newFixtures.workspaceDataset.sandboxTable({ id: 5, schema: {name: 'animals'}, objectName: 'dog_breeds'});
        var chartSubclass = chorus.models.ChartTask.extend({});
        chartSubclass.prototype.chartType = "fantastic";
        this.model = new chartSubclass({ dataset: this.dataset });
    });

    it("has the right url", function() {
        expect(this.model.url()).toBe("/datasets/5/visualizations");
        expect(this.model.url({ method: "delete" })).toBe("/datasets/5/visualizations/" + this.model.get("checkId"));
    });

    it("has the right name", function() {
        expect(this.model.name()).toMatchTranslation("dataset.visualization.data.filename");
    });

    it("sets the 'chart[type]' attribute based on the prototype's 'chartType' property", function() {
        expect(this.model.get("type")).toBe("fantastic");
    });

    it("sets datasetId", function() {
        expect(this.model.get("datasetId")).toBe(this.dataset.get("id"));
    });

    it("mixes in SQLResults", function() {
        expect(this.model.columnOrientedData).toBeDefined();
    });
});
