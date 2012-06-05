describe("chorus.models.DatabaseColumn", function() {
    beforeEach(function() {
        this.model = new chorus.models.DatabaseColumn({name: "Col", typeCategory: "WHOLE_NUMBER", type: 'varbit'});
    });

    describe("#initialize", function() {
        context("when there is not tabularData", function() {
            beforeEach(function() {
                this.model.initialize();
            });

            it("does not blow up", function() {
                expect(this.model.get('name')).toBe('Col');
            });

            it("sets the typeClass property on the model", function() {
                expect(this.model.get("typeClass")).toBe("numeric");
            })
        });

        context("when there is tabularData", function() {
            beforeEach(function() {
                this.tabularData = newFixtures.dataset.sandboxTable({objectName: 'taaab', schemaName: 'partyman'});
                this.model.tabularData = this.tabularData;
                this.model.initialize();
            });

            describe("#url", function() {
                it("is correct", function() {
                    this.model.set({
                        id: '1'
                    });
                    var attr = this.model.attributes;
                    var url = this.model.url();
                    expect(url).toContain("/database_objects/1/columns?");
                    expect(url).toContain("filter=" + attr.name);
                });
            });

            describe("#toText", function() {
                context("with lowercase names", function() {
                    beforeEach(function() {
                        this.model.set({name: "col"})
                    })
                    it("formats the string to put into the sql editor", function() {
                        expect(this.model.toText()).toBe('col');
                    })
                })
                context("with uppercase names", function() {
                    beforeEach(function() {
                        this.model.set({name: "Col", schemaName: "PartyMAN", parentName: "TAAAB"});
                    })
                    it("puts quotes around the uppercase names", function() {
                        expect(this.model.toText()).toBe('"Col"');
                    })
                })
            })

            describe("#typeClass", function() {
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
                        expect(new chorus.models.DatabaseColumn({ typeCategory : type }).get("typeClass")).toBe(str);
                    });
                })
            })

        });
    });
});
