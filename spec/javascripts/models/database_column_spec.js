describe("chorus.models.DatabaseColumn", function() {
    beforeEach(function() {
        this.model = new chorus.models.DatabaseColumn({name: "Col", type: 'varbit', parentName: 'taaab', schemaName: "partyman"});
    });

    describe("#toText", function() {
        context("with lowercase names", function() {
            beforeEach(function() {
                this.model.set({name: "col"})
            })
            it("formats the string to put into the sql editor", function() {
                expect(this.model.toText()).toBe('partyman.taaab.col');
            })
        })
        context("with uppercase names", function() {
            beforeEach(function() {
                this.model.set({name: "Col", schemaName: "PartyMAN", parentName: "TAAAB"});
            })
            it("puts quotes around the uppercase names", function() {
                expect(this.model.toText()).toBe('"PartyMAN"."TAAAB"."Col"');
            })
        })
    })

    describe("#humanType", function() {
        var expectedTypeMap = {
            "WHOLE_NUMBER" : "numeric",
            "REAL_NUMBER" : "numeric",
            "STRING" : "string",
            "LONG_STRING" : "string",
            "BINARY" : "binary",
            "BOOLEAN" : "boolean",
            "DATE" : "date",
            "TIME" : "time",
            "DATETIME" : "date_time",
            "OTHER" : "other"
        }

        _.each(expectedTypeMap, function(str, type) {
            it("works for " + type, function() {
                expect(new chorus.models.DatabaseColumn({ typeCategory : type }).humanType()).toBe(str)
            });
        })
    })
});
