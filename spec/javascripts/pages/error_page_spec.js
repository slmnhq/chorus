describe("chorus.pages.ErrorPage", function() {
    beforeEach(function() {
        spyOn(chorus.router, "navigate")
        this.page = new chorus.pages.Error();
        this.page.pageOptions = {
            title: "this is the title",
            text: "this is the page body"
        };
        this.page.render()
    });

    it("has the translations for the title", function() {
        expect(this.page.$('.title')).toContainText(this.page.pageOptions.title);
    });

    it("has the translations for the textbox content", function() {
        expect(this.page.$('.content')).toContainText(this.page.pageOptions.text);
    });

    it("has the translations for the button", function() {
        expect(this.page.$('button.submit')).toContainTranslation("actions.home")
    });

    it("navigates to the homepage on clicking the button", function() {
        this.page.$('button.submit').click();
        expect(chorus.router.navigate).toHaveBeenCalledWith("#", true)
    });
});
