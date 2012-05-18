describe("chorus.collections.SchemaSet", function() {
    beforeEach(function() {
        this.collection = fixtures.schemaSet({ instance_id: '50', instance_name: "jim", database_id: '41', database_name: "wicked_tables"});
    });

    it("has the right URL", function() {
        this.collection.attributes.database_id = "42";
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
                { name: "ron_the_schema", database_name: "wicked_tables", database_id: "41" },
                { name: "michelle_the_schema", database_name: "wicked_tables", database_id: "41" }
            ]);
        });

        it("sets the instance_id, instance name, database id and database name from the collection on each model", function() {
            expect(this.collection.at(0).get("instance_id")).toBe("50");
            expect(this.collection.at(0).get("instance_name")).toBe("jim");
            expect(this.collection.at(0).database().id).toBe("41");
            expect(this.collection.at(0).database().name()).toBe("wicked_tables");

            expect(this.collection.at(1).get("instance_id")).toBe("50");
            expect(this.collection.at(1).get("instance_name")).toBe("jim");
            expect(this.collection.at(1).database().id).toBe("41");
            expect(this.collection.at(1).database().name()).toBe("wicked_tables");
        });
    });
});
