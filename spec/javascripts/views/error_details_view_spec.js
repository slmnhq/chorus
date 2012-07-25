describe("chorus.views.ErrorDetails", function() {
    beforeEach(function() {
        this.model = rspecFixtures.activity.importFailed({ errorMessage: this.text });
        this.view = new chorus.views.ErrorDetails({ model: this.model });
    });

    describe("#render", function() {
        it("renders the text as a link to an ImportFailed alert", function() {
            this.view.render();
            expect(this.view.$(".details .alert").html()).toMatchTranslation(
                "activity.view_error_details");
            expect(this.view.$(".details .alert").attr("data-alert")).toContainText("ImportFailed")

        });
    });
});
