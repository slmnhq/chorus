describe("chorus.collections.SchemaSet", function() {
    beforeEach(function() {
        this.collection = fixtures.schemaSet({ instance_id: '50', instanceName: "jim", databaseId: '41', databaseName: "wicked_tables"});
    });

    it("has the right URL", function() {
        this.collection.attributes.databaseName = "%foo%";
        expect(this.collection.url()).toContain("/instance/50/database/%25foo%25/schema");
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
                { name: "ron_the_schema" },
                { name: "michelle_the_schema" }
            ]);
        });

        it("sets the instance_id, instance name, databaseId and databaseName from the collection on each model", function() {
            expect(this.collection.at(0).get("instance_id")).toBe("50");
            expect(this.collection.at(0).get("instanceName")).toBe("jim");
            expect(this.collection.at(0).get("databaseId")).toBe("41");
            expect(this.collection.at(0).get("databaseName")).toBe("wicked_tables");

            expect(this.collection.at(1).get("instance_id")).toBe("50");
            expect(this.collection.at(1).get("instanceName")).toBe("jim");
            expect(this.collection.at(1).get("databaseId")).toBe("41");
            expect(this.collection.at(1).get("databaseName")).toBe("wicked_tables");
        });
    });
});
