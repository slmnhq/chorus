describe("chorus.pages.InvalidRoutePage", function() {
    beforeEach(function() {
        this.page = new chorus.pages.InvalidRoutePage()
        this.page.render()
    });

    it("has the translations for the title", function() {
        expect(this.page.$('.title')).toContainTranslation("invalid_route.title")
    });

    it("has the translations for the textbox content", function() {
        expect(this.page.$('.content')).toContainTranslation("invalid_route.text")
    });
})
