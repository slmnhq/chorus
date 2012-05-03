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
        describe("with a model with errorMessage", function() {
            it("should have the correct title", function() {
                expect(this.alert.title).toBe("i am a title");
            });

            it("should have the correct text", function() {
                expect(this.alert.text).toBe("i am text");
            });

            it("gets the error message from the model's errorMessage function", function() {
                expect(this.alert.body).toBe(this.task.serverErrorMessage());
            });
        });

        describe("without a model, but with data attributes", function() {
            beforeEach(function() {
                this.launchElement = $("<a/>");
                this.launchElement.attr("data-body", "Something failed");
                this.launchElement.attr("data-title", "There was an error!");
                this.alert = new FakeAlert({ launchElement: this.launchElement });
            });

            it("should have the correct title", function() {
               expect(this.alert.title).toBe("There was an error!");
            });

            it("should have the correct body", function() {
               expect(this.alert.body).toBe("Something failed");
            });
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
