describe("chorus.pages.UnprocessableEntityPage", function() {
    beforeEach(function() {
        this.page = new chorus.pages.UnprocessableEntityPage()
        this.page.render()
    });

    it("has the translations for the title", function() {
        expect(this.page.$('.title')).toContainTranslation("unprocessable_entity.title")
    });

    it("has the translations for the textbox content", function() {
        expect(this.page.$('.content')).toContainTranslation("unprocessable_entity.text")
    });
})
