chorus.models.ProvisioningTemplate = chorus.models.Base.extend({
    constructorName: "ProvisioningTemplate",
    nameAttribute: "name",

    toText: function() {
        var key = "provisioning.templates." + this.get("name");
        return t(key, {cpu: this.get("vcpuNumber"), mem: this.get("memorySizeInGb")});
    }
});