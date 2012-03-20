describe("chorus.alerts.ExecutionMessage", function() {
    beforeEach(function() {
        this.task = fixtures.task({
            result: {
                message: "hi there"
            }
        });
        this.alert = new chorus.alerts.ExecutionMessage({ model: this.task });
        this.alert.render();
    });

    it("has the correct title", function() {
        expect(this.alert.title).toMatchTranslation("workfile.execution.message.title");
    });

    it("has no secondary text", function() {
        expect(this.alert.text).toBeFalsy();
    });

    it("has the 'info' class (so that it displays the right icon)", function() {
        expect($(this.alert.el)).toHaveClass("info");
    });

    it("displays the task's result message", function() {
        expect(this.alert.body).toBe("hi there");
    });

    it("only has one button", function() {
        expect(this.alert.$("button.submit")).toHaveClass("hidden");
    });
});
