describe("WorkspaceSet", function() {
    var models = chorus.models;

    beforeEach(function() {
        fixtures.model = 'WorkspaceSet';
        this.collection = new models.WorkspaceSet();
    });

    it("has the correct urlTemplate", function() {
        expect(this.collection.urlTemplate).toBe("workspace/");
    })
});
