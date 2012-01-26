describe("chorus.alerts.ExecutionError", function() {
    beforeEach(function() {
        this.launchElement = $("<a></a>");
        this.task = fixtures.taskWithErrors();
        this.alert = new chorus.alerts.ExecutionError({ pageModel: this.task });
    });
    
    describe("#makeModel", function() {
        it("should have the correct title", function() {
            expect(this.alert.title).toMatchTranslation("workfile.execution.alert.title");
        });

        it("should have the correct text", function() {
            expect(this.alert.text).toMatchTranslation("workfile.execution.alert.text");
        });
        
        it("gets the error message from the task model", function(){
            expect(this.alert.body).toBe(this.task.errorMessage());
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.alert.render();
        });
        
        it("should only have one button", function() {
            expect(this.alert.$("button.submit")).toHaveClass("hidden");
        });
        
        it("should display a 'Close Window' button", function() {
            expect(this.alert.$("button.cancel").text()).toMatchTranslation("actions.close_window");
        });
    });
})
