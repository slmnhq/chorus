describe("InstanceAccountSet", function() {
    beforeEach(function() {
        this.instanceAccountSet = new chorus.models.InstanceAccountSet([], {instanceId: '17'});
    });

    describe("#url", function() {
        it("has the instanceId in the url parameters", function() {
            expect(this.instanceAccountSet.url()).toContain("/edc/instance/accountmap?instanceId=17");
        });
    });
});
