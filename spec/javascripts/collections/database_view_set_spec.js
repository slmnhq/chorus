describe("chorus.models.DatabaseViewSet", function() {
    beforeEach(function() {
        this.collection = new chorus.models.DatabaseViewSet([], {instanceId: "50", databaseName: "partyman", schemaName: "myschema"});
    });

    it("has the correct urlTemplate", function() {
        expect(this.collection.url()).toContain("/edc/data/50/database/partyman/schema/myschema/view");
    })
});
