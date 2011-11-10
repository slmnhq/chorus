describe("chorus.views.Dialog", function() {
    describe("#render", function() {
        beforeEach(function() {
            this.loadTemplate("plain_text");
            this.dialog = new chorus.dialogs.Base();
            this.dialog.title = "OH HAI";
            this.dialog.className = "plain_text";
            this.dialog.additionalContext = function() {
                return {
                    text : "OMG IM IN A DIALOG WHOA"
                }
            }

            this.dialog.render()
        })

        it("displays the title in the #dialog_header", function() {
            expect(this.dialog.$("#dialog_header h1").text()).toBe("OH HAI")
        })

        it("renders the view in the #dialog_content", function() {
            expect(this.dialog.$("#dialog_content").text()).toBe("OMG IM IN A DIALOG WHOA")
        })
    })
})