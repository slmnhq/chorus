describe("chorus.models.InstanceSharing", function() {
    beforeEach(function() {
        this.sharing = new chorus.models.InstanceSharing({instanceId: 1})
    });

    it("has a valid url", function() {
        expect(this.sharing.url()).toBe("/gpdb_instances/1/sharing");
    });
});
