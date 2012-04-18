describe("chorus.collections.ProvisioningTemplateSet", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.ProvisioningTemplateSet([
            newFixtures.provisioningTemplate({name: "small"}),
            newFixtures.provisioningTemplate({name: "median"}),
            newFixtures.provisioningTemplate({name: "large"})
        ], {provisionerPluginName: "A4CProvisioner"});
    });

    it("should have the correct url", function() {
        var url = this.collection.url();
        expect(url).toMatchUrl("/edc/provisioning/A4CProvisioner", {paramsToIgnore: ["page", "rows", "type"]});
        expect(url).toContainQueryParams({type: "template"});
    });
});