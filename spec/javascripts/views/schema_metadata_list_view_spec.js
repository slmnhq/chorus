describe("chorus.views.SchemaMetadataList", function() {
    beforeEach(function() {
        this.view = new chorus.views.SchemaMetadataList({ model : fixtures.workfile() });
        this.view.collection = fixtures.tableSet([], {instanceId: "50", databaseName: "partyman", schemaName: "myschema"});
        this.view.resource.loaded = true;
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("renders an li for each item in the collection", function() {
            expect(this.view.$("li").length).toBe(this.view.collection.length);
        });
    });
});
