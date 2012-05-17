describe("chorus.collections.SchemaFunctionSet", function() {
    beforeEach(function() {
        this.schema = fixtures.schema();
        this.functionSet = this.schema.functions();
    });

    describe("#urlTemplate", function() {
        beforeEach(function() {
            this.schema = fixtures.schema({instance_id: 10000, database_name: "%foo%", name: "b/a/r"});
            this.functionSet = this.schema.functions();
        });

        it("encodes the url", function() {
            expect(this.functionSet.url()).toContain("/instance/10000/database/%25foo%25/schema/b%2Fa%2Fr/function");
        });
    });

    describe("sort", function() {
        beforeEach(function() {
            this.functionSet.reset([
                fixtures.schemaFunction({ functionName: 'z'}),
                fixtures.schemaFunction({ functionName: 'G'}),
                fixtures.schemaFunction({ functionName: 'a'})
            ]);
        });

        it("sorts by functionName, case insensitive", function() {
            var functionNames = this.functionSet.pluck('functionName')
            expect(functionNames).toEqual(['a', 'G', 'z']);
        })
    });

    describe("add", function() {
        it("sets the schemaName on the added function", function() {
            this.functionSet.add(fixtures.schemaFunction());
            expect(this.functionSet.models[0].get('schemaName')).not.toBeFalsy();
            expect(this.functionSet.models[0].get('schemaName')).toBe(this.schema.get('name'));
        })
    });
});
