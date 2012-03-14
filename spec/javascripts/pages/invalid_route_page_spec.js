describe("chorus.pages.InvalidRoutePage", function() {
    describe("#render with pageOptions", function() {
        beforeEach(function() {
            spyOn(chorus.router, "navigate")

            this.page = new chorus.pages.InvalidRoutePage()

            this.page.pageOptions = {
                title: "Hello",
                text: "world"
            }
            this.page.render()
        })

        it("has the translations for the title", function() {
            expect(this.page.$('.title')).toContainText("Hello");
        })

        it("has the translations for the textbox content", function() {
            expect(this.page.$('.content')).toContainText("world");
        })

        it("has the translations for the button", function() {
            expect(this.page.$('button.submit')).toContainTranslation("invalid_route.home")
        })

        it("navigates to the homepage on clicking the button", function() {
            this.page.$('button.submit').click();
            expect(chorus.router.navigate).toHaveBeenCalledWith("#", true)
        })
    })

    describe("#render without overrides", function() {
        beforeEach(function() {
            spyOn(chorus.router, "navigate")

            this.page = new chorus.pages.InvalidRoutePage()
            this.page.render()
        })

        it("has the translations for the title", function() {
            expect(this.page.$('.title')).toContainTranslation("invalid_route.title")
        })

        it("has the translations for the textbox content", function() {
            expect(this.page.$('.content')).toContainTranslation("invalid_route.content")
        })

        it("has the translations for the button", function() {
            expect(this.page.$('button.submit')).toContainTranslation("invalid_route.home")
        })

        it("navigates to the homepage on clicking the button", function() {
            this.page.$('button.submit').click();
            expect(chorus.router.navigate).toHaveBeenCalledWith("#", true)
        })
    })
})
