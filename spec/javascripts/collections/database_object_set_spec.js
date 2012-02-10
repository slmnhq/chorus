describe("chorus.collections.DatabaseObjectSet", function() {
    describe("#url", function() {
        it("is correct", function() {
            var collection = new chorus.collections.DatabaseObjectSet([], {instanceId: 10000, databaseName:"some_database", schemaName: "some_schema"});
            expect(collection.url({ rows: 10, page: 1})).toMatchUrl("/edc/data/10000/database/some_database/schema/some_schema?rows=10&page=1&type=meta");
        });
    });
});