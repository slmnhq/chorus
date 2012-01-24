describe("chorus.models.SchemaFunctionSet", function() {
    beforeEach(function() {
        this.schema = fixtures.schema();
        this.functionSet = this.schema.functions();
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
