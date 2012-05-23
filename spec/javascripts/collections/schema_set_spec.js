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
});
