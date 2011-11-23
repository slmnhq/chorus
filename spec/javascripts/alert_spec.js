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


    describe("#launchAlert", function() {
        beforeEach(function() {
            spyOn($, "facebox")
            spyOn(this.alert, "render")
            spyOn(this.alert, "el")
            this.alert.launchAlert()
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