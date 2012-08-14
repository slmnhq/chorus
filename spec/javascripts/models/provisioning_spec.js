describe("chorus.models.Provisioning", function () {
    beforeEach(function () {
        this.model = new chorus.models.Provisioning();
    });

    it("has the appropriate #downloadUrl", function () {
        expect(this.model.url()).toBe("/provisioning");
    })

    describe("#isInstalled", function () {
        it("returns true when the 'installationStatus' property is set appropriately", function () {
            this.model.set({ installSucceed:true });
            expect(this.model.isInstalled()).toBeTruthy();
        });

        it("returns false when the 'installationStatus' property is NOT set appropriately", function () {
            this.model.set({ installSucceed:false });
            expect(this.model.isInstalled()).toBeFalsy();
        });
    });

    describe("#getTemplates", function () {
        beforeEach(function () {
            this.model = rspecFixtures.provisioning();
        });

        it("returns an array of Provisioning Templates", function () {
            var provisioningTemplate = this.model.getTemplates()[0];

            expect(this.model.getTemplates()).toBeA(Array);
            expect(provisioningTemplate.name(), "small");
            expect(provisioningTemplate.get("vcpuNumber"), 1);
            expect(provisioningTemplate.get("memorySizeInMb"), 4096);
        });
    });
});
