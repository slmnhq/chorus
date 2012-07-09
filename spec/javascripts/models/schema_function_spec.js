describe("chorus.models.SchemaFunction", function() {
    beforeEach(function() {
        this.model = fixtures.schemaFunction({schemaName: "aa", functionName: "fun", argNames: ["elephant", ""], argTypes: ["Int", "Bool"]});
    })
    describe("#toText", function() {
        context("with lowercase names", function() {
            it("formats the string to put into the sql editor", function() {
                expect(this.model.toText()).toBe('aa.fun(Int elephant, Bool arg2)');
            });
        });
        context("with uppercase letters in the names", function() {
            beforeEach(function() {
                this.model.set({schemaName: "Aa", functionName: "fuN"});
            })
            it("puts quotes around the uppercase names", function() {
                expect(this.model.toText()).toBe('"Aa"."fuN"(Int elephant, Bool arg2)');
            });
        })

    });

    describe("#toHintText", function() {
        it("formats the string correctly", function() {
            expect(this.model.toHintText()).toBe("void fun(Int elephant, Bool arg2)")
        })
    });

    describe("#formattedArgumentList(ensureParams)", function () {
        it("returns a formatted argument list", function () {
            expect(this.model.formattedArgumentList()).toBe("(Int elephant, Bool arg2)");
        });

        context("when the function takes no parameters", function () {
            context("when the 'ensureParams' flag is false", function () {
                it("returns an empty string", function () {
                    this.model.set({ argNames: null, argTypes: null });
                    expect(this.model.formattedArgumentList()).toBe("");
                });
            });

            context("when the 'ensureParams' flag is true", function () {
                it("returns empty parens", function () {
                    this.model.set({ argNames: null, argTypes: null });
                    expect(this.model.formattedArgumentList(true)).toBe("()");
                });
            });
        });
    });
})