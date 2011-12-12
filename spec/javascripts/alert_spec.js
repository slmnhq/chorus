describe("chorus.views.Alert", function() {
    beforeEach(function() {
        this.model = new chorus.models.Base({ id: "foo"});
        this.alert = new chorus.alerts.Base({ model : this.model });
        this.loadTemplate("alert");
        this.alert.title = "OH HAI";
        this.alert.text = "How are you?"
        this.alert.ok = "Do it!"
    })

    describe("#render", function() {
        beforeEach(function() {
            this.alert.render()
        })

        it("displays the title", function() {
            expect(this.alert.$("h1").text()).toBe("OH HAI")
        })

        it("displays the text", function() {
            expect(this.alert.$("p").text()).toBe("How are you?")
        })

        it("displays the icon", function() {
            expect(this.alert.$("img")).toHaveAttr("src", "images/message_icon.png")
        })

        it("displays the 'ok' text on the submit button", function() {
            expect(this.alert.$("button.submit").text()).toBe("Do it!");
        })

        it("displays server errors", function() {
            this.alert.resource.set({serverErrors : [
                { message: "Hi there" }
            ]});
            this.alert.render();

            expect(this.alert.$(".errors").text()).toContain("Hi there")
        })
    })


    describe("#launchModal", function() {
        beforeEach(function() {
            spyOn($, "facebox")
            spyOn(this.alert, "render")
            spyOn(this.alert, "el")
            this.alert.launchModal()
        })

        it("creates a facebox", function() {
            expect($.facebox).toHaveBeenCalledWith(this.alert.el);
        })

        it("renders in the facebox", function() {
            expect(this.alert.render).toHaveBeenCalled();
        })
    })

    describe("Clicking the cancel button", function() {
        beforeEach(function() {
            this.alert.render();
            spyOnEvent($(document), "close.facebox");
            this.alert.$("button.cancel").click();
        })

        it("dismisses the alert", function() {
            expect("close.facebox").toHaveBeenTriggeredOn($(document))
        });
    });
})

describe("ModelDelete alert", function() {
    beforeEach(function() {
        this.loadTemplate("alert")
        this.model = new chorus.models.User();
        this.alert = new chorus.alerts.ModelDelete({  model: this.model });
        stubModals();
        this.alert.launchModal();
        this.alert.redirectUrl = "/partyTime"
        this.alert.text = "Are you really really sure?"
        this.alert.title = "A standard delete alert"
        this.alert.ok = "Delete It!"
    });

    describe("render", function() {
        beforeEach(function() {
            spyOn($.fn, 'focus');
            this.alert.render();
        })

        it("focuses on the cancel button", function() {
            var self = this;

            waitsFor(function() {
                return $.fn.focus.callCount && $.fn.focus.mostRecentCall.object.is("button.cancel");
            }, "cancel button to get focus", 250);
        })
    })

    describe("clicking delete", function() {
        beforeEach(function() {
            this.alert.render();
            spyOn(this.alert.model, "destroy");
            this.alert.$("button.submit").click();
        })

        it("deletes the model", function() {
            expect(this.alert.model.destroy).toHaveBeenCalled();
        });

        describe("when the model deletion is successful", function() {
            beforeEach(function() {
                spyOn(chorus.router, "navigate");
                spyOnEvent($(document), "close.facebox");
                this.alert.model.trigger("destroy", this.alert.model);
            });

            it("dismisses the alert", function () {
                expect("close.facebox").toHaveBeenTriggeredOn($(document))
            });

            it("navigates to the redirectUrl", function() {
                expect(chorus.router.navigate).toHaveBeenCalledWith("/partyTime", true);
            });
        })

        describe("when the model deletion fails", function() {
            beforeEach(function() {
                spyOnEvent($(document), "close.facebox");
                this.alert.resource.set({serverErrors : [
                    { message: "Hi there" }
                ]});
                this.alert.model.trigger("destroyFailed", this.alert.model);
            })

            it("does not dismiss the dialog", function() {
                expect("close.facebox").not.toHaveBeenTriggeredOn($(document));
            })
        })
    })

    describe("clicking cancel", function() {
        beforeEach(function() {
            this.alert.render();
            this.alert.$("button.cancel").click();
            spyOn(chorus.router, "navigate");
            this.alert.model.trigger("destroy", this.alert.model);
        })

        it("unbinds events on the model", function() {
            expect(chorus.router.navigate).not.toHaveBeenCalled();
        })
    })
})

