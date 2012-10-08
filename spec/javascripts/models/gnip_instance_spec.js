describe("chorus.models.GnipInstance", function() {
    beforeEach(function() {
        this.model = new chorus.models.GnipInstance({id:123});
        this.attrs = {};
    });

    it("has the right url", function() {
        expect(this.model.url()).toBe("/gnip_instances/123");
    });

    it("has the correct entityType", function() {
        expect(this.model.entityType).toBe("gnip_instance");
    });

    it("returns true for isHadoop", function() {
        expect(this.model.isHadoop()).toBeFalsy();
    });

    it("returns false for isGreenplum", function() {
        expect(this.model.isGreenplum()).toBeFalsy();
    });

    it("returns false for isGnip", function() {
        expect(this.model.isGnip()).toBeTruthy();
    });

    _.each(["name", "host", "port", "username", "password"], function(attr) {
        it("requires " + attr, function() {
            this.attrs[attr] = "";
            expect(this.model.performValidation(this.attrs)).toBeFalsy();
            expect(this.model.errors[attr]).toBeTruthy();
        })
    });
});