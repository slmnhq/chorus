describe("chorus.collections.SchemaSet", function() {
    beforeEach(function() {
        this.collection = fixtures.schemaSet({ instanceId: '50', databaseId: '41', databaseName: "wicked_tables"});
    });

    describe("#sort", function() {
        beforeEach(function() {
            this.collection.reset([
                fixtures.schema({ name: 'z'}),
                fixtures.schema({ name: 'G'}),
                fixtures.schema({ name: 'a'})
            ]);
        });

        it("sorts by name, case insensitive", function() {
            var names = this.collection.pluck('name')
            expect(names).toEqual(['a', 'G', 'z']);
        })
    });

    describe("#parse", function() {
        beforeEach(function() {
            this.collection.fetch();
            this.server.lastFetchFor(this.collection).succeed([
                { name: "ron_the_schema" },
                { name: "michelle_the_schema" }
            ]);
        });

        it("sets the instanceId, databaseId and databaseName from the collection on each model", function() {
            expect(this.collection.at(0).get("instanceId")).toBe("50");
            expect(this.collection.at(0).get("databaseId")).toBe("41");
            expect(this.collection.at(0).get("databaseName")).toBe("wicked_tables");

            expect(this.collection.at(1).get("instanceId")).toBe("50");
            expect(this.collection.at(1).get("databaseId")).toBe("41");
            expect(this.collection.at(1).get("databaseName")).toBe("wicked_tables");
        });
    });
});
