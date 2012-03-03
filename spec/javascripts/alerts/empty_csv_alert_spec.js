describe("chorus.alerts.EmptyCSV", function() {
    beforeEach(function() {
        this.alert = new chorus.alerts.EmptyCSV();
    });

    it("has the correct title", function() {
        expect(this.alert.title).toMatchTranslation("empty_csv.title")
    });

    it("has the correct text", function() {
        expect(this.alert.text).toMatchTranslation("empty_csv.text")
    });

    describe("#render", function() {
        beforeEach(function() {
            this.alert.render();
        });

        it("has the error class", function() {
            expect($(this.alert.el)).toHaveClass("error");
        });

        it("hides the submit button", function() {
            expect(this.alert.$("button.submit")).toHaveClass("hidden")
        });
    });
})
