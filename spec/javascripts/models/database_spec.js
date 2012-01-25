describe("chorus.models.Database", function() {
    beforeEach(function() {
        this.model = fixtures.database({ instanceId: '1', id: '2' });
    });
    describe("#schemas", function() {
        beforeEach(function() {
            this.schemas = this.model.schemas();
        });

        it("returns a schema set with the right instance and database id", function() {
            expect(this.schemas).toBeA(chorus.collections.SchemaSet);
            expect(this.schemas.attributes.instanceId).toBe("1");
            expect(this.schemas.attributes.databaseId).toBe("2");
        });
    });
});
