describe("chorus.alerts", function() {
    beforeEach(function() {
        spyOn(chorus.alerts.Base.prototype, "cancelAlert").andCallThrough();
        this.model = new chorus.models.Base({ id: "foo"});
        this.alert = new chorus.alerts.Base({ model : this.model });
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
            expect(this.alert.$("img")).toHaveAttr("src", "/images/message_icon.png")
        })

        it("displays the 'ok' text on the submit button", function() {
            expect(this.alert.$("button.submit").text()).toBe("Do it!");
        })

        it("displays the default cancel text on the cancel button", function() {
            expect(this.alert.$("button.cancel").text()).toMatchTranslation("actions.cancel");
        })

        it("should not render the body section", function() {
            expect(this.alert.$(".body")).not.toExist();
        });

        context("when a message body is provided", function() {
            beforeEach(function() {
                this.alert.body = "Hello World!"
                this.alert.render();
            })

            it("should show the body section", function() {
                expect(this.alert.$(".body")).toExist();
                expect(this.alert.$(".body p").text().trim()).toBe("Hello World!");
            });
        });

        context("when a custom cancel is provided", function() {
            beforeEach(function() {
                this.alert.cancel = "Don't do it!"
                this.alert.render();
            })

            it("displays the 'cancel' text on the cancel button", function() {
                expect(this.alert.$("button.cancel").text()).toBe("Don't do it!");
            })
        })

        it("displays server errors", function() {
            this.alert.resource.set({serverErrors : { fields: { connection: { INVALID: { message: "Couldn't find host/port to connect to" } } } }});
            this.alert.render();

            expect(this.alert.$(".errors").text()).toContain("Couldn't find host/port to connect to")
        })
    })

    describe("#launchModal", function() {
        beforeEach(function() {
            delete chorus.modal;
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

        it("calls cancelAlert", function() {
            expect(this.alert.cancelAlert).toHaveBeenCalled();
        })

        describe("the default cancelAlert", function() {
            it("dismisses the alert", function() {
                expect("close.facebox").toHaveBeenTriggeredOn($(document))
            });
        });
    });
})

describe("chorus.alerts.ModelDelete", function() {
    beforeEach(function() {
        this.model = new chorus.models.User();
        this.alert = new chorus.alerts.ModelDelete({  model: this.model });
        stubModals();
        this.alert.launchModal();
        this.alert.redirectUrl = "/partyTime"
        this.alert.text = "Are you really really sure?"
        this.alert.title = "A standard delete alert"
        this.alert.ok = "Delete It!"
        this.alert.deleteMessage = "It has been deleted"
    });

    describe("#revealed", function() {
        beforeEach(function() {
            spyOn($.fn, 'focus');
            this.alert.render();
        })

        it("focuses on the cancel button", function() {
            this.alert.revealed();
            expect($.fn.focus).toHaveBeenCalled();
            expect($.fn.focus.mostRecentCall.object).toBe("button.cancel");
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

        it("sets the delete button to the loading state", function() {
            expect(this.alert.$("button.submit").isLoading()).toBeTruthy();
        });

        describe("when the model deletion is successful", function() {
            beforeEach(function() {
                spyOn(chorus.router, "navigate");
                spyOnEvent($(document), "close.facebox");
                spyOn(chorus, "toast");
                this.deleteParams = {foo: "bar"};
                spyOn(this.alert, "deleteMessageParams").andReturn(this.deleteParams);
            });

            it("dismisses the alert", function () {
                this.alert.model.trigger("destroy", this.alert.model);
                expect("close.facebox").toHaveBeenTriggeredOn($(document))
            });

            it("navigates to the redirectUrl", function() {
                this.alert.model.trigger("destroy", this.alert.model);
                expect(chorus.router.navigate).toHaveBeenCalledWith("/partyTime");
            });

            it("displays the delete success toast message", function() {
                this.alert.model.trigger("destroy", this.alert.model);
                expect(this.alert.deleteMessageParams).toHaveBeenCalled();
                expect(chorus.toast).toHaveBeenCalledWith(this.alert.deleteMessage, this.deleteParams);
            });

            context("when the alert does NOT have a redirect url", function() {
                it("does not navigate", function() {
                    delete this.alert.redirectUrl;
                    this.alert.model.trigger("destroy", this.alert.model);
                    expect(chorus.router.navigate).not.toHaveBeenCalled();
                });
            });
        })

        describe("when the model deletion fails", function() {
            beforeEach(function() {
                spyOnEvent($(document), "close.facebox");
                this.alert.resource.set({serverErrors: { fields: { a: { INVALID : { message: "Hi there"}}} }});
                this.alert.model.trigger("destroyFailed", this.alert.model);
            })

            it("does not dismiss the dialog", function() {
                expect("close.facebox").not.toHaveBeenTriggeredOn($(document));
            })

            it("puts the button out of the loading state", function() {
                expect(this.alert.$("button.submit").isLoading()).toBeFalsy();
            });
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

