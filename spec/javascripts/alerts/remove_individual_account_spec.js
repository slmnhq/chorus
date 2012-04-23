describe("chorus.alerts.RemoveIndividualAccount", function() {
    beforeEach(function() {
        this.alert = new chorus.alerts.RemoveIndividualAccount({instanceName: "someInstance", name: "joey boy"});
        this.alert.render();
    });

    it("displays the confirmation message", function() {
        expect(this.alert.$("h1").text().trim()).toMatchTranslation("instances.remove_individual_account.title", {instanceName: "someInstance", userName: "joey boy"});
        expect(this.alert.$("button.submit").text().trim()).toMatchTranslation("instances.remove_individual_account.remove")
    });

    it("raises the 'removeIndividualAccount' event when the submit button is clicked", function() {
        spyOnEvent(this.alert, 'removeIndividualAccount');
        this.alert.$("button.submit").click();
        expect('removeIndividualAccount').toHaveBeenTriggeredOn(this.alert);
    });

    it("closes when the account delete request responds is clicked", function() {
        spyOnEvent($(document), "close.facebox");
        this.alert.$("button.submit").click();
        expect("close.facebox").toHaveBeenTriggeredOn($(document))
    });
})
