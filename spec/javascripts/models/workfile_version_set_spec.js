describe("chorus.models.WorkfileVersion", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.WorkfileVersionSet([],{workspaceId: 1, workfileId: 2});
        this.collection.add({versionNum: 1});
        this.collection.add({versionNum: 2});
        this.collection.add({versionNum: 3});
    });
    it("should sort the collection by version number", function() {
        expect(this.collection.models[0].get("versionNum")).toBe(3);
        expect(this.collection.models[1].get("versionNum")).toBe(2);
        expect(this.collection.models[2].get("versionNum")).toBe(1);
    });
});
