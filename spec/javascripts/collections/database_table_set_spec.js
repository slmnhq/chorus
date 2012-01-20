describe("chorus.collections.DatabaseTableSet", function() {
    beforeEach(function() {
        this.collection = new chorus.models.DatabaseTableSet([], {instanceId: "50", databaseName: "partyman", schemaName: "myschema"});
    });

    it("has the correct urlTemplate", function() {
        expect(this.collection.url()).toContain("/edc/data/50/database/partyman/schema/myschema/table");
    })
});
