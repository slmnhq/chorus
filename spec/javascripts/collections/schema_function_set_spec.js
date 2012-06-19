describe("chorus.collections.SchemaFunctionSet", function() {
    beforeEach(function() {
        this.schema = rspecFixtures.schema();
        this.functionSet = this.schema.functions();
    });

    describe("#urlTemplate", function() {
        beforeEach(function() {
            this.schema = rspecFixtures.schema({name: "b/a/r", database: {name: "%foo%", instance: {id: 10000} }});
            this.functionSet = this.schema.functions();
        });

        it("encodes the url", function() {
            expect(this.functionSet.url()).toContain("/schemas/"+ this.schema.id +"/functions");
        });
    });

    describe("sort", function() {
        beforeEach(function() {
            this.functionSet.reset([
                fixtures.schemaFunction({ name: 'z'}),
                fixtures.schemaFunction({ name: 'G'}),
                fixtures.schemaFunction({ name: 'a'})
            ]);
        });

        it("sorts by functionName, case insensitive", function() {
            var functionNames = this.functionSet.pluck('name')
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
