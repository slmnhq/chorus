describe("chorus.alerts.Error", function() {
    var FakeAlert = chorus.alerts.Error.extend({
        title: 'i am a title',
        text: 'i am text'
    });
    beforeEach(function() {
        this.task = fixtures.taskWithErrors();
        this.alert = new FakeAlert({model: this.task});
    });
    
    describe("#makeModel", function() {
        it("should have the correct title", function() {
            expect(this.alert.title).toBe("i am a title");
        });

        it("should have the correct text", function() {
            expect(this.alert.text).toBe("i am text");
        });
        
        it("gets the error message from the model's errorMessage function", function(){
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
