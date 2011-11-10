describe("chorus.models.Workspace", function() {
    var models = chorus.models;
    beforeEach(function() {
        fixtures.model = 'Workspace';
        this.model = new models.Workspace();
    });

    it("has the correct urlTemplate", function() {
        expect(this.model.urlTemplate).toBe("workspace/{{id}}");
    })
});