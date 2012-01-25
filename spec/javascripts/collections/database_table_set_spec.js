describe("chorus.collections.DatabaseTableSet", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.DatabaseTableSet([], {instanceId: "50", databaseName: "partyman", schemaName: "myschema"});
    });

    it("has the correct urlTemplate", function() {
        expect(this.collection.url()).toContain("/edc/data/50/database/partyman/schema/myschema/table");
    });

    describe("#findByName", function() {
        beforeEach(function() {
            this.collection.reset([
                fixtures.databaseTable({ name: "garbage" }),
                fixtures.databaseTable({ name: "monsters" }),
                fixtures.databaseTable({ name: "foods" }),
                fixtures.databaseTable({ name: "beverages" })
            ]);
        });

        context("when a table with the given name exists in the collection", function() {
            it("returns that table", function() {
                expect(this.collection.findByName("garbage")).toBe(this.collection.models[0]);
            });
        });

        context("when no table with the given name exists in the collection", function() {
            it("returns undefined", function() {
                expect(this.collection.findByName("potpourri")).toBeFalsy();
            });
        });
    });

    describe("#parse", function() {
        beforeEach(function() {
            this.collection.fetch();
            this.server.lastFetchFor(this.collection).succeed([
                { name: "brian_the_table" },
                { name: "rand_the_table" }
            ]);
        });

        it("sets the instanceId, databaseName, and schemaName from the collection on each model", function() {
            expect(this.collection.at(0).get("instanceId")).toBe("50");
            expect(this.collection.at(0).get("databaseName")).toBe("partyman");
            expect(this.collection.at(0).get("schemaName")).toBe("myschema");

            expect(this.collection.at(1).get("instanceId")).toBe("50");
            expect(this.collection.at(1).get("databaseName")).toBe("partyman");
            expect(this.collection.at(1).get("schemaName")).toBe("myschema");
        });
    });
});
