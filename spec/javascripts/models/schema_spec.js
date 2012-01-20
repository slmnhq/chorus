describe("chorus.models.Schema", function() {

    context("from a sandbox", function() {
        beforeEach(function() {
            this.sandbox = fixtures.sandbox();
            this.model = this.sandbox.schema();
        });
        
        describe("functions", function() {
            it("should return a SchemaFunctionSet", function() {
                var functionSet = this.model.functions();
                expect(functionSet).toBeA(chorus.models.SchemaFunctionSet);
            });

            it("should memoize the result", function() {
                expect(this.model.functions()).toBe(this.model.functions());
            });

            it("should pass the instanceId, databaseId, and schemaId", function() {
                expect(this.model.functions().attributes.instanceId).toBe(this.model.get('instanceId'));
                expect(this.model.functions().attributes.databaseId).toBe(this.model.get('databaseId'));
                expect(this.model.functions().attributes.schemaId).toBe(this.model.get('id'));
            });
        });
    });
});