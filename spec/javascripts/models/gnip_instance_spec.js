describe("chorus.models.GnipInstance", function() {
    beforeEach(function() {
        this.model = new chorus.models.GnipInstance({id:123});
        this.attrs = {};
    });

    it("has the right url", function() {
        expect(this.model.url()).toBe("/gnip_instances/123");
    });

    it("is shared", function() {
        expect(this.model.isShared()).toBeTruthy();
    });

    it("has the right showUrlTemplate", function() {
        expect(this.model.showUrl()).toBe("#/gnip_instances/123");
    });

    it("has the right provider icon url", function() {
        expect(this.model.providerIconUrl()).toBe("/images/instances/gnip.png");
    });

    it("has the correct entityType", function() {
        expect(this.model.entityType).toBe("gnip_instance");
    });

    it("returns true for isGnip", function() {
        expect(this.model.isGnip()).toBeTruthy();
    });

    _.each(["name", "host", "port", "username", "password"], function(attr) {
        it("requires " + attr, function() {
            this.attrs[attr] = "";
            expect(this.model.performValidation(this.attrs)).toBeFalsy();
            expect(this.model.errors[attr]).toBeTruthy();
        })
    });

    describe("#sharedAccountDetails", function() {
        it("returns the account name of the user who owns the instance and shared it", function() {
            var sharedAccountDetails = this.model.get("username");
            expect(this.model.sharedAccountDetails()).toBe(sharedAccountDetails);
        });
    });
});