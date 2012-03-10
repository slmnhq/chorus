describe("chorus.collections.TabularDataSet", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.TabularDataSet();
    })

    it("doesn't override type when type already exists", function() {
        var model = chorus.models.DynamicTabularData({ type: "foo"})
        this.collection.add(model);
        expect(model.get("type")).toBe("foo")
    })

    it("sets type to datasetType if datasetType exists", function() {
        var model = chorus.models.DynamicTabularData({ datasetType: "foo"})
        this.collection.add(model);
        expect(model.get("type")).toBe("foo")
    })

    it("sets type to SOURCE_TABLE if neither type nor datasetType exists", function() {
        var model = chorus.models.DynamicTabularData({})
        this.collection.add(model);
        expect(model.get("type")).toBe("SOURCE_TABLE")
    })
});