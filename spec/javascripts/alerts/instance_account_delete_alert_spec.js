describe("chorus.alerts.InstanceAccountDelete", function() {
    beforeEach(function() {
        this.launchElement = $("<a></a>");
        this.instance = fixtures.instance({ id: '456' });
        setLoggedInUser({ id: "1011" });
        this.alert = new chorus.alerts.InstanceAccountDelete({ pageModel: this.instance });
    });

    it("does not have a redirect url", function() {
        expect(this.alert.redirectUrl).toBeUndefined();
    });

    describe("#makeModel", function() {
        it("gets the current user's account for the instance that is the current page model", function(){
            expect(this.alert.model.get("userId")).toBe("1011");
            expect(this.alert.model.get("instanceId")).toBe("456");
        });
    });

    describe("successful deletion", function() {
        beforeEach(function() {
            spyOn(chorus.router, "navigate");
            spyOn(chorus, "toast");
            spyOnEvent($(document), "close.facebox");
            this.alert.model.trigger("destroy", this.alert.model);
        });

        it("displays a toast message", function() {
            expect(chorus.toast).toHaveBeenCalledWith("instances.account.delete.toast");
        });
    })
})
