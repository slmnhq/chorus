chorus.models.ProvisioningTemplate = chorus.models.Base.extend({
    constructorName: "ProvisioningTemplate",
    nameAttribute: "name",

    toText: function() {
        var key = "provisioning.templates." + this.get("name");
        return t(key, {cpu: this.get("cpuNumber"), mem: this.get("memorySize")});
    }
});