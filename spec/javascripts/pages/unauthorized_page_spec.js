describe("chorus.pages.UnauthorizedPage", function() {
    beforeEach(function() {
        this.page = new chorus.pages.UnauthorizedPage();
        this.page.render();
    });

    it("has the translations for the title", function() {
        expect(this.page.$('.title')).toContainTranslation("unauthorized.title");
    });

    it("has the translations for the textbox content", function() {
        expect(this.page.$('.content')).toContainTranslation("unauthorized.text");
    });
});
