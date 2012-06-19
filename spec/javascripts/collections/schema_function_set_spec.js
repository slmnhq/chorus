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
            this.functionSet = rspecFixtures.schemaFunctionSet();
        });

        it("sorts by functionName, case insensitive", function() {
            var functionNames = this.functionSet.pluck('name')
            expect(functionNames).toEqual(['foo', 'hello', 'ZOO']);
        })
    });
});
