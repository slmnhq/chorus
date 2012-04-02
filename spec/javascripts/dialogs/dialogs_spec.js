describe("chorus.views.Dialog", function() {
    beforeEach(function() {
        this.dialog = new chorus.dialogs.Base();
        this.dialog.title = "OH HAI";
        this.dialog.className = "plain_text";
        this.dialog.additionalContext = function() {
            return {
                text : "OMG IM IN A DIALOG WHOA"
            }
        }
        spyOn(chorus, 'placeholder');
    })

    describe("#render", function() {
        beforeEach(function() {
            this.dialog.render()
        })

        it("displays the title in the .dialog_header", function() {
            expect(this.dialog.$(".dialog_header h1").text()).toBe("OH HAI")
        })

        it("renders the view in the .dialog_content", function() {
            expect(this.dialog.$(".dialog_content").text()).toBe("OMG IM IN A DIALOG WHOA")
        })

        it("sets up input placeholders for older browsers", function() {
            expect(chorus.placeholder).toHaveBeenCalledWith(this.dialog.$("input[placeholder], textarea[placeholder]"));
        });

        context("with a function as the title", function() {
            beforeEach(function() {
                this.dialog.title = function() {return 'foo'};
                this.dialog.render();
            });

            it("displays the results of the function", function() {
                expect(this.dialog.$(".dialog_header h1")).toContainText('foo');
            });
        });
    });


    describe("#launchModal", function() {
        beforeEach(function() {
            delete chorus.modal;

            spyOn($, "facebox")
            spyOn(this.dialog, "render")
            spyOn(this.dialog, "el")
            this.dialog.launchModal()
        })

        it("creates a facebox", function() {
            expect($.facebox).toHaveBeenCalledWith(this.dialog.el);
        })

        it("renders the dialog", function() {
            expect(this.dialog.render).toHaveBeenCalled();
        })
    })

    describe("Clicking the cancel button", function(){
        beforeEach(function() {
            this.dialog.render();
            this.dialog.$(".dialog_content").append("<div class='modal_controls'><button class='cancel'>no</button></div>")
            spyOnEvent($(document), "close.facebox");
            this.dialog.$("button.cancel").click();
        })
        it("dismisses the dialog", function(){
            expect("close.facebox").toHaveBeenTriggeredOn($(document))
        });
    });
})
