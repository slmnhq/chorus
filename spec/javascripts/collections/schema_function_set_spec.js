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
});
