describe("chorus.collections.DatabaseColumnSet", function() {

    describe("database table column", function() {
        beforeEach(function() {
            this.collection = new chorus.collections.DatabaseColumnSet([], {instanceId : "2", databaseName : "db1", schemaName: "schema1", tableName: "table1"});
        });
        it("has the correct urlTemplate", function() {
            expect(this.collection.url()).toContain("/edc/data/2/database/db1/schema/schema1/table/table1/column");
        })

        describe("add", function() {
            it("sets the schemaName and tableName (as parentName) on the added column", function() {
                this.collection.add(fixtures.databaseColumn());
                expect(this.collection.models[0].get('schemaName')).toBe('schema1');
                expect(this.collection.models[0].get('parentName')).toBe('table1');
            })
        });

    });

    describe("database view column", function() {
        beforeEach(function() {
            this.collection = new chorus.collections.DatabaseColumnSet([], {instanceId : "2", databaseName : "db1", schemaName: "schema1", viewName: "view1"});
        });

        it("has the correct urlTemplate", function() {
            expect(this.collection.url()).toContain("/edc/data/2/database/db1/schema/schema1/view/view1/column");
        })
        describe("add", function() {
            it("sets the schemaName and viewName (as parentName) on the added column", function() {
                this.collection.add(fixtures.databaseColumn());
                expect(this.collection.models[0].get('schemaName')).toBe('schema1');
                expect(this.collection.models[0].get('parentName')).toBe('view1');
            })
        });

    });


});
