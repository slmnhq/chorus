describe("spec_helper", function() {
    describe("stubQtip", function() {
        beforeEach(function() {
            this.span = $("<span></span>");
            this.anchor = $("<a></a>");
            this.el = $("<div></div>").append(this.span).append(this.anchor);

            this.anchorQtip = stubQtip("a");
            this.spanQtip = stubQtip("span");
        });

        it("returns a different fake qtip element for every unique selector", function() {
            expect(this.anchorQtip).toBeA(jQuery);
            expect(this.spanQtip).toBeA(jQuery);

            expect(this.anchorQtip).not.toBe(this.spanQtip);
        });

        describe("when qtip is called on one of the stubbed selectors", function() {
            beforeEach(function() {
                this.el.find("a").qtip({ content: "<li>fake</li>" });
            });

            it("only affects the fake qtip element for that selector", function() {
                this.el.find('a').mouseenter();
                expect(this.anchorQtip.find("li")).toHaveText("fake");

                this.el.find('span').mouseenter();
                expect(this.spanQtip).not.toContain("li");
            });
        });
    });
});
