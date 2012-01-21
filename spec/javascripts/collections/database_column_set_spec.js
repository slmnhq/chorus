describe("chorus.collections.DatabaseColumnSet", function() {

    describe("database table column", function() {
        beforeEach(function() {
            this.collection = new chorus.models.DatabaseColumnSet([], {instanceId : "2", databaseName : "db1", schemaName: "schema1", tableName: "table1"});
        });
        it("has the correct urlTemplate", function() {
            expect(this.collection.url()).toContain("/edc/data/2/database/db1/schema/schema1/table/table1/column");
        })
    });

    describe("database view column", function() {
        beforeEach(function() {
            this.collection = new chorus.models.DatabaseColumnSet([], {instanceId : "2", databaseName : "db1", schemaName: "schema1", viewName: "view1"});
        });

        it("has the correct urlTemplate", function() {
            expect(this.collection.url()).toContain("/edc/data/2/database/db1/schema/schema1/view/view1/column");
        })
    });
});
