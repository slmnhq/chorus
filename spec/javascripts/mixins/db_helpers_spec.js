describe("chorus.Mixins.dbHelpers", function() {
    describe(".safePGName", function() {
        beforeEach(function() {
            this.originalValidationRegexes = chorus.ValidationRegexes;
        });

        afterEach(function() {
            chorus.ValidationRegexes = this.originalValidationRegexes;
        })

        context("with one argument", function() {
            context("when the name matches chorus.ValidationRegexes.SafePgName", function() {
                beforeEach(function() {
                    chorus.ValidationRegexes = {
                        SafePgName: function() { return /.*/ }
                    }
                });

                it("does not quote the name", function() {
                    expect(chorus.Mixins.dbHelpers.safePGName("foo")).toBe("foo");
                });
            });

            context("when the name does not match chorus.ValidationRegexes.SafePgName", function() {
                beforeEach(function() {
                    chorus.ValidationRegexes = {
                        SafePgName: function() { return /no match/ }
                    }
                });

                it("quotes the name", function() {
                    expect(chorus.Mixins.dbHelpers.safePGName("foo")).toBe('"foo"');
                });
            });
        })

        context("with two arguments", function() {
            it("encodes each argument separately, then concatenates them with '.'", function() {
                expect(chorus.Mixins.dbHelpers.safePGName("Foo", "bar")).toBe('"Foo".bar')
            })
        })
    })

    describe("pgsqlRealEscapeString", function() {
        it("replaces single quotes with two single quotes", function() {
            expect(chorus.Mixins.dbHelpers.sqlEscapeString("John's Father's Boat's Hull")).toBe("John''s Father''s Boat''s Hull");
        });
    });
});
