describe("chorus.models.DynamicTabularData", function() {
    it("should return a chorus view when the json contains a chorus view", function() {
        var model = new chorus.models.DynamicTabularData({datasetType: "CHORUS_VIEW"});
        expect(model).toBeA(chorus.models.Dataset);
    });

    it("should return database object when the json does not contain a chorus view", function() {
        var model = new chorus.models.DynamicTabularData({datasetType: "SANDWICH"});
        expect(model).toBeA(chorus.models.DatabaseObject);
    });
});