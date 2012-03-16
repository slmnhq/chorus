describe("chorus.Mixins.dbHelpers", function() {
    describe(".safePGName", function() {
        context("with one argument", function() {
            context("with uppercase", function() {
                it("should displays quotes around the name", function() {
                    expect(chorus.Mixins.dbHelpers.safePGName("Hello")).toBe('"Hello"');
                });
            });

            context("with all lowercase", function() {
                it("should not displays quotes around the name", function() {
                    expect(chorus.Mixins.dbHelpers.safePGName("hello")).toBe('hello');
                });
            });

            context("with a number as the first character", function() {
                it("should display quotes around the name", function() {
                    expect(chorus.Mixins.dbHelpers.safePGName("1up")).toBe('"1up"');
                })
            })

            context("with a quoted value", function() {
                it("should display one set of quotes around the name", function() {
                    expect(chorus.Mixins.dbHelpers.safePGName('"IamQuoted"')).toBe('"IamQuoted"');
                })
            })
        })

        context("with two arguments", function() {
            it("encodes each argument separately, then concatenates them with '.'", function() {
                expect(chorus.Mixins.dbHelpers.safePGName("Foo", "bar")).toBe("\"Foo\".bar")
            })
        })
    })

    describe("pgsqlRealEscapeString", function() {
        it("replaces single quotes with two single quotes", function() {
            expect(chorus.Mixins.dbHelpers.sqlEscapeString("John's Father's Boat's Hull")).toBe("John''s Father''s Boat''s Hull");
        });
    });
});
