describe("chorus.models.DatabaseColumn", function() {
    beforeEach(function() {
        this.model = new chorus.models.DatabaseColumn({name: "Col", type: 'varbit', parentName: 'taaab', schemaName: "partyman"});
    });

    describe("#toString", function() {
        it("formats the string to put into the sql editor", function(){
            expect(this.model.toString()).toBe('"partyman"."taaab"."Col"');
        })
    })
});
