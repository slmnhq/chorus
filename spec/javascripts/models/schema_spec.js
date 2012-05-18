describe("chorus.models.Schema", function() {
    describe("#showUrl", function() {
        beforeEach(function() {
            this.model = fixtures.schema({id: 1234, instance_id : 10000, database_id: "42", name : "b/a/r"});
        })
        it("should encode the url", function() {
            expect(this.model.showUrl()).toContain("schemas/1234");
        });
    });

    context("from a sandbox", function() {
        beforeEach(function() {
            this.sandbox = newFixtures.sandbox();
            this.model = this.sandbox.schema();
        });

        describe("#databaseObjects", function() {
            it("should return a DataaseObjectSet", function() {
                expect(this.model.databaseObjects()).toBeA(chorus.collections.DatabaseObjectSet);
            });

            it("should memoize the result", function() {
                expect(this.model.databaseObjects()).toBe(this.model.databaseObjects());
            });

            it("should pass the instance_id, database_name, and schemaName", function() {
                var objects = this.model.databaseObjects();
                expect(objects.attributes.instance_id).toBe(this.model.get('instance_id'));
                expect(objects.attributes.databaseName).toBe(this.model.database().name());
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

            it("should pass the instance_id, databaseId, and schemaId", function() {
                expect(this.model.functions().attributes.instance_id).toBe(this.model.get('instance_id'));
                expect(this.model.functions().attributes.databaseId).toBe(this.model.database().id);
                expect(this.model.functions().attributes.schemaId).toBe(this.model.get('id'));
            });
        });
    });

    describe("#canonicalName", function() {
        beforeEach(function() {
            this.model = fixtures.schema({instance_name : "instance", database_name : "database", name : "schema"});
        })

        it("should create the canonical name", function() {
            expect(this.model.canonicalName()).toBe("instance.database.schema");
        });
    });

    describe("#isEqual", function() {
        beforeEach(function() {
            this.model = fixtures.schema({
                instance_id:   '1',
                instance_name: 'bar',
                database_id:   '2',
                database_name: 'foo',
                id:           '3',
                name:         'baz'
            });
        });

        it("checks that the names and ids of the instances, databases and schemas are equal", function() {
            var other = fixtures.schema({
                instance_id:   '1',
                instance_name: 'bar',
                database_id:   '2',
                database_name: 'foo',
                id:           '3',
                name:         'baz'
            });

            expect(this.model.isEqual(other)).toBeTruthy();

            other.set({ instance_id: '5' });

            expect(this.model.isEqual(other)).toBeFalsy();
        });
    });

    describe("#database", function() {
        beforeEach(function() {
            this.model = fixtures.schema({instance_name : "instance", database_name : "database", name : "schema"});
            this.database = this.model.database();
        });

        it("returns a database with the right id and instance_id", function() {
            expect(this.database).toBeA(chorus.models.Database);
            expect(this.database.get("id")).toBe(this.model.database().id);
            expect(this.database.get("instance_id")).toBe(this.model.get("instance_id"));
        });

        it("memoizes", function() {
            expect(this.database).toBe(this.model.database());
        });
    });
});
