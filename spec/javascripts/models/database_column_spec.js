describe("chorus.models.DatabaseColumn", function() {
    beforeEach(function() {
        this.model = new chorus.models.DatabaseColumn({name: "Col", type: 'varbit', parentName: 'taaab', schemaName: "partyman"});
    });

    describe("#toString", function() {
        context("with lowercase names", function() {
            beforeEach(function() {
                this.model.set({name: "col"})
            })
            it("formats the string to put into the sql editor", function() {
                expect(this.model.toString()).toBe('partyman.taaab.col');
            })
        })
        context("with uppercase names", function() {
            beforeEach(function() {
                this.model.set({name: "Col", schemaName: "PartyMAN", parentName: "TAAAB"});
            })
            it("puts quotes around the uppercase names", function() {
                expect(this.model.toString()).toBe('"PartyMAN"."TAAAB"."Col"');
            })
        })
    })
});
