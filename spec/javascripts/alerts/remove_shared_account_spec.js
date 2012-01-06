describe("RemoveSharedAccount", function() {
    beforeEach(function() {
        this.alert = new chorus.alerts.RemoveSharedAccount();
        this.alert.render();
    })

    it("displays the confirmation message", function() {
        expect(this.alert.$("h1").text().trim()).toMatchTranslation("instances.remove_shared_account.title");
        expect(this.alert.$("p").text().trim()).toMatchTranslation("instances.remove_shared_account.text");
        expect(this.alert.$("button.submit").text().trim()).toMatchTranslation("instances.remove_shared_account.remove")
    });

    it("raises the 'removeSharedAccount' event when the submit button is clicked", function() {
        spyOnEvent(this.alert, 'removeSharedAccount');
        this.alert.$("button.submit").click();
        expect('removeSharedAccount').toHaveBeenTriggeredOn(this.alert);
    });

    it("closes when the submit button is clicked", function() {
        spyOnEvent($(document), "close.facebox");
        this.alert.$("button.submit").click();
        expect("close.facebox").toHaveBeenTriggeredOn($(document))
    })
})
