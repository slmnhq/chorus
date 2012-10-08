describe("chorus.views.KaggleHeader", function() {
    beforeEach(function() {
        this.view = new chorus.views.KaggleHeader()
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });
        it("shows the dipslay name", function() {
            expect(this.view.$(".summary").text()).toContainTranslation("kaggle.summary");
        });
        it("shows the kaggle logo", function() {
            expect(this.view.$("img").attr("src")).toBe("/images/kaggle.png");
        });
    });
});
