describe("chorus.models.ProvisioningTemplate", function() {
    beforeEach(function() {
        this.model = new chorus.models.ProvisioningTemplate({
            name: "small",
            memorySize: 4,
            cpuNumber: 1
        });
    });

    describe("#toText", function() {
        it("returns the complete text", function() {
            expect(this.model.toText()).toMatchTranslation("provisioning.templates.small", {cpu: "1", mem: "4"});
        });
    });
});