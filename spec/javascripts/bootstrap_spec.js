describe("window.t", function () {
    beforeEach(function() {
        spyOn(I18n, "t");
    });

    context("with no options", function () {
        it("calls I18n.t with the value given", function () {
            t("hello.world");
            expect(I18n.t).toHaveBeenCalledWith("hello.world", []);
        });
    });

    context("with options", function () {
        context("with regular options", function () {
            it("calls I18n.t with the value given", function () {
                t("hello.world", { some:"thing" });
                expect(I18n.t).toHaveBeenCalledWith("hello.world", { some:"thing" });
            })
        });

        context("with a functionCallContext", function () {
            it("calls the function with the given context", function () {
                var targetContext = { funktion: function() { return "test.abc"; } };
                spyOn(targetContext.funktion, "apply").andCallThrough();
                t(targetContext.funktion, { some: "thing", functionCallContext: targetContext });

                expect(targetContext.funktion.apply).toHaveBeenCalledWith(targetContext, []);
                expect(I18n.t).toHaveBeenCalledWith("test.abc", { some: "thing" });
            });
        });
    });
});