describe("chorus.pages.UserNewPage", function() {
    beforeEach(function() {
        this.page = new chorus.pages.UserNewPage()
    });

    it("has a helpId", function() {
        expect(this.page.helpId).toBe("user_new")
    })

    describe("#render", function(){
        it("renders successfully", function() {
            this.page.render()
        })
    })
})
