describe("chorus.collections.DatasetSet", function() {
    describe("#url", function() {
        it("is correct when given just a workspace", function() {
            var collection = new chorus.collections.DatasetSet([], {workspaceId: 10000});
            expect(collection.url({rows: 10, page: 1})).toMatchUrl("/edc/workspace/10000/dataset?rows=10&page=1");
        });

        it("is correct when given an instance Id, and a database and schema name", function() {
            var collection = new chorus.collections.DatasetSet([], {instanceId: 10000, databaseName:"some_database", schemaName: "some_schema"});
            expect(collection.url({ rows: 10, page: 1})).toMatchUrl("/edc/data/10000/database/some_database/schema/some_schema?rows=10&page=1");
        });
    });
});