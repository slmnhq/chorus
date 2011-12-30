describe("chorus.models.Provisioning", function() {
    beforeEach(function() {
        this.model = new chorus.models.Provisioning({ provisionerPluginName : 'A4CProvisioner', type : "install"});
    });

    it("has the appropriate #downloadUrl", function() {
        expect(this.model.url()).toBe("/edc/provisioning/A4CProvisioner?type=install");
    })
});