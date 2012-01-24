describe("chorus.models.SchemaFunction", function() {
    beforeEach(function() {
        this.model = fixtures.schemaFunction({schemaName: "aa", functionName: "fun", argNames: ["elephant", ""], argTypes: ["Int", "Bool"]});
    })
    describe("#toString", function() {
        it("formats the string to put into the sql editor", function(){
            expect(this.model.toString()).toBe('"aa"."fun"(Int elephant, Bool arg2)');
        })
    })
})