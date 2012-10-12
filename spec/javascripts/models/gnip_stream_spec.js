describe("chorus.models.GnipStream", function() {
    beforeEach(function() {
        this.model = new chorus.models.GnipStream();
        this.model.set({gnip_instance_id: 33});
        this.attrs = {};
    });

    _.each(["workspaceId", "toTable"], function(attr) {
        it("requires " + attr, function() {
            this.attrs[attr] = "";
            expect(this.model.performValidation(this.attrs)).toBeFalsy();
            expect(this.model.errors[attr]).toBeTruthy();
        });
    });

    it("has the correct urlTemplate", function() {
        expect(this.model.url()).toBe("/gnip_instances/33/imports");
    });

});
