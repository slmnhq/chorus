describe("chorus.models.Provisioning", function() {
    beforeEach(function() {
        this.model = new chorus.models.Provisioning({ provisionerPluginName : 'A4CProvisioner', type : "install"});
    });

    it("has the appropriate #downloadUrl", function() {
        expect(this.model.url()).toBe("/edc/provisioning/A4CProvisioner?type=install");
    })

    describe("#isInstalled", function() {
        it("returns true when the 'installationStatus' property is set appropriately", function() {
            this.model.set({ installationStatus: "install_succeed" });
            expect(this.model.isInstalled()).toBeTruthy();
        });

        it("returns false when the 'installationStatus' property is NOT set appropriately", function() {
            this.model.set({ installationStatus: "not_installed" });
            expect(this.model.isInstalled()).toBeFalsy();
        });
    });
});
