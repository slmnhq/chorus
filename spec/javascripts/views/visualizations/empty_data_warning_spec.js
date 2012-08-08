describe("chorus.views.visualizations.EmptyDataWarning", function () {
    beforeEach(function () {
        this.view = new chorus.views.visualizations.EmptyDataWarning({message: t("visualization.empty_data")})
    });

    describe("#render", function () {
        beforeEach(function () {
            this.view.render();
        });
        it("displays the correct message", function () {
            expect(this.view.$(".empty_data").text()).toContainTranslation("visualization.empty_data");
        });
    });
});