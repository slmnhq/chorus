describe("chorus.views.Dialog", function() {
    beforeEach(function() {
        this.dialog = new chorus.dialogs.Base();
    })

    describe("#render", function() {
        beforeEach(function() {
            this.loadTemplate("plain_text");
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


    describe("#initFacebox", function() {
        beforeEach(function() {
            spyOn($, "facebox")
            spyOn(this.dialog, "render")
            this.dialog.initFacebox()
        })

        it("creates a facebox", function() {
            expect($.facebox).toHaveBeenCalledWith(this.dialog.container);
        })

        it("creates a facebox", function() {
            expect(this.dialog.render).toHaveBeenCalled();
        })
    })

})