describe("chorus.models.Schema", function() {
    describe("#showUrl", function() {
        beforeEach(function() {
            this.model = fixtures.schema({instanceId : 10000, databaseName : "%foo%", name : "b/a/r"});
        })
        it("should encode the url", function() {
            expect(this.model.showUrl()).toContain("instances/10000/databases/%2525foo%2525/schemas/b%252Fa%252Fr");
        });
    });

    context("from a sandbox", function() {
        beforeEach(function() {
            this.sandbox = fixtures.sandbox();
            this.model = this.sandbox.schema();
        });

        describe("#databaseObjects", function() {
            it("should return a DataaseObjectSet", function() {
                expect(this.model.databaseObjects()).toBeA(chorus.collections.DatabaseObjectSet);
            });

            it("should memoize the result", function() {
                expect(this.model.databaseObjects()).toBe(this.model.databaseObjects());
            });

            it("should pass the instanceId, databaseName, and schemaName", function() {
                var objects = this.model.databaseObjects();
                expect(objects.attributes.instanceId).toBe(this.model.get('instanceId'));
                expect(objects.attributes.databaseName).toBe(this.model.get('databaseName'));
                expect(objects.attributes.schemaName).toBe(this.model.get('name'));
            });
        });

        describe("functions", function() {
            it("should return a SchemaFunctionSet", function() {
                var functionSet = this.model.functions();
                expect(functionSet).toBeA(chorus.collections.SchemaFunctionSet);
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

    describe("#canonicalName", function() {
        beforeEach(function() {
            this.model = fixtures.schema({instanceName : "instance", databaseName : "database", name : "schema"});
        })

        it("should create the canonical name", function() {
            expect(this.model.canonicalName()).toBe("instance.database.schema");
        });
    });

    describe("#isEqual", function() {
        beforeEach(function() {
            this.model = fixtures.schema({
                instanceId:   '1',
                instanceName: 'bar',
                databaseId:   '2',
                databaseName: 'foo',
                id:           '3',
                name:         'baz'
            });
        });

        it("checks that the names and ids of the instances, databases and schemas are equal", function() {
            var other = fixtures.schema({
                instanceId:   '1',
                instanceName: 'bar',
                databaseId:   '2',
                databaseName: 'foo',
                id:           '3',
                name:         'baz'
            });

            expect(this.model.isEqual(other)).toBeTruthy();

            other.set({ instanceId: '5' });

            expect(this.model.isEqual(other)).toBeFalsy();
        });
    });

    describe("#database", function() {
        beforeEach(function() {
            this.model = fixtures.schema({instanceName : "instance", databaseName : "database", name : "schema"});
            this.database = this.model.database();
        });

        it("returns a database with the right id and instanceId", function() {
            expect(this.database).toBeA(chorus.models.Database);
            expect(this.database.get("id")).toBe(this.model.get("databaseId"));
            expect(this.database.get("instanceId")).toBe(this.model.get("instanceId"));
        });

        it("memoizes", function() {
            expect(this.database).toBe(this.model.database());
        });
    });
});
