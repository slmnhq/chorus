describe("chorus.models.GnipStream", function() {
    beforeEach(function() {
        this.model = new chorus.models.GnipStream();
        this.attrs = {};
    });

    _.each(["workspaceId", "toTable"], function(attr) {
        it("requires " + attr, function() {
            this.attrs[attr] = "";
            expect(this.model.performValidation(this.attrs)).toBeFalsy();
            expect(this.model.errors[attr]).toBeTruthy();
        });
    });

});
