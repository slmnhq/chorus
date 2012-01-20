describe("chorus.models.Schema", function() {

    context("from a sandbox", function() {
        beforeEach(function() {
            this.sandbox = fixtures.sandbox();
            this.model = this.sandbox.schema();
        });

        describe("#tables", function() {
            it("should return a TableSet", function() {
                var tableSet = this.model.tables();
                expect(tableSet).toBeA(chorus.models.TableSet);
            });

            it("should memoize the result", function() {
                expect(this.model.tables()).toBe(this.model.tables());
            });

            it("should pass the instanceId, databaseName, and schemaName", function() {
                expect(this.model.tables().attributes.instanceId).toBe(this.model.get('instanceId'));
                expect(this.model.tables().attributes.databaseName).toBe(this.model.get('databaseName'));
                expect(this.model.tables().attributes.schemaName).toBe(this.model.get('name'));
            });
        });

        describe("#views", function() {
            it("should return a DatabaseViewSet", function() {
                var viewSet = this.model.views();
                expect(viewSet).toBeA(chorus.models.DatabaseViewSet);
            });

            it("should memoize the result", function() {
                expect(this.model.views()).toBe(this.model.views());
            });

            it("should pass the instanceId, databaseName, and schemaName", function() {
                expect(this.model.views().attributes.instanceId).toBe(this.model.get('instanceId'));
                expect(this.model.views().attributes.databaseName).toBe(this.model.get('databaseName'));
                expect(this.model.views().attributes.schemaName).toBe(this.model.get('name'));
            });
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