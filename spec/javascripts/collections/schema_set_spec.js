describe("chorus.collections.SchemaSet", function() {
    beforeEach(function() {
        this.collection = fixtures.schemaSet({ instanceId: '50', instanceName: "jim", databaseId: '41', databaseName: "wicked_tables"});
    });

    it("has the right URL", function() {
        this.collection.attributes.databaseId = "42";
        expect(this.collection.url()).toContain("/databases/42/schemas");
    });

    it("includes the InstanceCredentials mixin", function() {
        expect(this.collection.instanceRequiringCredentials).toBe(chorus.Mixins.InstanceCredentials.model.instanceRequiringCredentials);
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
                { name: "ron_the_schema", databaseName: "wicked_tables", databaseId: "41" },
                { name: "michelle_the_schema", databaseName: "wicked_tables", databaseId: "41" }
            ]);
        });

        it("sets the instanceId, instance name, database id and database name from the collection on each model", function() {
            expect(this.collection.at(0).get("instanceId")).toBe("50");
            expect(this.collection.at(0).get("instanceName")).toBe("jim");
            expect(this.collection.at(0).database().id).toBe("41");
            expect(this.collection.at(0).database().name()).toBe("wicked_tables");

            expect(this.collection.at(1).get("instanceId")).toBe("50");
            expect(this.collection.at(1).get("instanceName")).toBe("jim");
            expect(this.collection.at(1).database().id).toBe("41");
            expect(this.collection.at(1).database().name()).toBe("wicked_tables");
        });
    });
});
