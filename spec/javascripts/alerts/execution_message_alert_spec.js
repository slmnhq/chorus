describe("chorus.alerts.ExecutionMessage", function() {
    beforeEach(function() {
        this.task = rspecFixtures.workfileExecutionResults();
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

    context("when there are warnings", function() {
        beforeEach(function() {
            this.task = rspecFixtures.workfileExecutionResultsWithWarning();
            this.alert.model = this.task;
            this.alert.render();
        });

        it("displays the warnings", function() {
            expect(this.alert.body).toContainText(this.task.get("warnings")[0]);
        });
    });

    context("when there are no warnings", function() {
        beforeEach(function() {
            expect(this.task.get("warnings").length).toBe(0);
            this.alert.render();
        });

        it("displays the success message", function() {
            expect(this.alert.body).toMatchTranslation("sql_execution.success");
        });
    });

    it("only has one button", function() {
        expect(this.alert.$("button.submit")).toHaveClass("hidden");
    });
});
