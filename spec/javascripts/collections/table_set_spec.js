describe("chorus.collections.TableSet", function() {
    beforeEach(function() {
        this.collection = new chorus.models.TableSet([], {instanceId: "50", databaseName: "partyman", schemaName: "myschema"});
    });

    it("has the correct urlTemplate", function() {
        expect(this.collection.url()).toContain("/edc/data/50/database/partyman/schema/myschema/table");
    })
});
