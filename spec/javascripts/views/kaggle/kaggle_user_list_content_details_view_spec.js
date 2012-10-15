describe("chorus.views.KaggleUserListContentDetails", function () {
    beforeEach(function () {
        this.view = new chorus.views.KaggleUserListContentDetails();
    });

    it("sets up the KaggleFilterWizard", function() {
        expect(this.view.filterWizardView).toBeA(chorus.views.KaggleFilterWizard);
    });

    describe("render", function () {
        beforeEach(function () {
            this.view.render();
        });

        it("puts the filter wizard subview in the filters div", function() {
            expect($(this.view.el).find(this.view.filterWizardView.el).length).toBeGreaterThan(0);
        });
    });
});