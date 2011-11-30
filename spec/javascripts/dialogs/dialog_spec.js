describe("chorus.views.Dialog", function() {
    beforeEach(function() {
        this.dialog = new chorus.dialogs.Base();
        this.loadTemplate("plain_text");
        this.dialog.title = "OH HAI";
        this.dialog.className = "plain_text";
        this.dialog.additionalContext = function() {
            return {
                text : "OMG IM IN A DIALOG WHOA"
            }
        }
    })

    describe("#render", function() {
        beforeEach(function() {
            this.dialog.render()
        })

        it("displays the title in the #dialog_header", function() {
            expect(this.dialog.$("#dialog_header h1").text()).toBe("OH HAI")
        })

        it("renders the view in the #dialog_content", function() {
            expect(this.dialog.$("#dialog_content").text()).toBe("OMG IM IN A DIALOG WHOA")
        })
    })


    describe("#launchModal", function() {
        beforeEach(function() {
            spyOn($, "facebox")
            spyOn(this.dialog, "render")
            spyOn(this.dialog, "el")
            this.dialog.launchModal()
        })

        it("creates a facebox", function() {
            expect($.facebox).toHaveBeenCalledWith(this.dialog.el);
        })

        it("creates a facebox", function() {
            expect(this.dialog.render).toHaveBeenCalled();
        })
    })

    describe("Clicking the cancel button", function(){
        beforeEach(function() {
            this.dialog.render();
            this.dialog.$("#dialog_content").append("<button class='cancel'>no</button>")
            spyOnEvent($(document), "close.facebox");
            this.dialog.$("button.cancel").click();
        })
        it("dismisses the dialog", function(){
            expect("close.facebox").toHaveBeenTriggeredOn($(document))
        });
    });

})
