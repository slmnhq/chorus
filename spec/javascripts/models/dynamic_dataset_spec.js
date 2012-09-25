describe("chorus.models.DynamicDataset", function() {
    it("should return a chorus view when the json contains a chorus view", function() {
        var model = new chorus.models.DynamicDataset({workspace: rspecFixtures.workspace()});
        expect(model).toBeA(chorus.models.WorkspaceDataset);
    });

    it("should return database object when the json does not contain a chorus view", function() {
        var model = new chorus.models.DynamicDataset({datasetType: "SANDWICH"});
        expect(model).toBeA(chorus.models.Dataset);
    });
});