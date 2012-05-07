describe("chorus.models.InstanceSharing", function() {
    beforeEach(function() {
        this.sharing = new chorus.models.InstanceSharing({instance_id: 1})
    });

    it("has a valid url", function() {
        expect(this.sharing.url()).toBe("/instances/1/sharing");
    });
});
