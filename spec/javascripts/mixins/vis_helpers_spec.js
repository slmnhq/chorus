describe("chorus.Mixins.VisHelpers", function() {
    describe("#labelFormat", function() {
        beforeEach(function() {
            this.hostView = _.extend(chorus.views.visualizations.XAxis, chorus.Mixins.VisHelpers);
        })

        describe("when given a number", function() {
            it("returns the same number as a string if it is short enough", function() {
                expect(this.hostView.labelFormat(123.45, 6)).toBe("123.45");
            });

            it("converts the number to scientific notation if it is too long", function() {
                expect(this.hostView.labelFormat(123.456789, 5)).toBe("1.23e+2");
            });

            it("converts the number to scientific notation if it is longer than 6 characters and no limit is specified", function() {
                expect(this.hostView.labelFormat(123.456)).toBe("1.23e+2");
            });
        });

        describe("when given a string", function() {
            it("returns the string un-altered if the string is short enough", function() {
                expect(this.hostView.labelFormat("abcdef", 6)).toBe("abcdef");
            });

            it("truncates the string to the length if it is too long", function() {
                expect(this.hostView.labelFormat("abcdef", 4)).toBe("abc…")
            });

            it("truncates the string to 15 characters if no limit is specified", function() {
                expect(this.hostView.labelFormat("abcdefghijklmnopqrstuvwxyz")).toBe("abcdefghijklmn…");
            });
        });
    });
})

