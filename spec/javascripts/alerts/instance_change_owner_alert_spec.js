describe("chorus.alerts.InstanceChangeOwner", function() {
    beforeEach(function() {
        this.alert = new chorus.alerts.InstanceChangeOwner({ displayName: "Boxiong Ding" });
        this.alert.render();
    })

    it("displays the confirmation message", function() {
        var title = this.alert.$("h1").text().trim();
        expect(title).toMatchTranslation("instances.confirm_change_owner.title", { displayName: "Boxiong Ding"});
        expect(this.alert.$("p").text().trim()).toMatchTranslation("instances.confirm_change_owner.text");
        expect(this.alert.$("button.submit").text().trim()).toMatchTranslation("instances.confirm_change_owner.change_owner");
    });

    it("raises the 'confirmChangeOwner' event when the submit button is clicked", function() {
        spyOnEvent(this.alert, 'confirmChangeOwner');
        this.alert.$("button.submit").click();
        expect('confirmChangeOwner').toHaveBeenTriggeredOn(this.alert);
    });

    it("closes when the submit button is clicked", function() {
        spyOnEvent($(document), "close.facebox");
        this.alert.$("button.submit").click();
        expect("close.facebox").toHaveBeenTriggeredOn($(document))
    });
})
