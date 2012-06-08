describe("chorus.alerts.InstanceChangeOwner", function() {
    beforeEach(function() {
        this.user = rspecFixtures.user({ firstName: "Boxiong", lastName: "Ding" });
        this.alert = new chorus.alerts.InstanceChangeOwner({ model: this.user });
        this.alert.render();
    })

    it("displays the confirmation message", function() {
        var title = this.alert.$("h1").text().trim();
        expect(title).toMatchTranslation("instances.confirm_change_owner.title", { displayName: "Boxiong Ding"});
        expect(this.alert.$("p").text().trim()).toMatchTranslation("instances.confirm_change_owner.text");
        expect(this.alert.$("button.submit").text().trim()).toMatchTranslation("instances.confirm_change_owner.change_owner");
    });

    it("raises the 'confirmChangeOwner' event when the submit button is clicked, passing the user as a parameter", function() {
        var confirmSpy = jasmine.createSpy("confirmChangeOwner");
        this.alert.bind("confirmChangeOwner", confirmSpy);

        this.alert.$("button.submit").click();

        expect(confirmSpy).toHaveBeenCalledWith(this.user);
    });

    it("closes when the submit button is clicked", function() {
        spyOnEvent($(document), "close.facebox");
        this.alert.$("button.submit").click();
        expect("close.facebox").toHaveBeenTriggeredOn($(document))
    });
})
