describe("chorus.alerts.ExecutionError", function() {
    beforeEach(function() {
        this.task = fixtures.taskWithErrors();
        this.alert = new chorus.alerts.ExecutionError({ model: this.task });
    });
    
    describe("#makeModel", function() {
        it("should have the correct title", function() {
            expect(this.alert.title).toMatchTranslation("workfile.execution.alert.title");
        });

        it("should have the correct text", function() {
            expect(this.alert.text).toMatchTranslation("workfile.execution.alert.text");
        });
    });

})
