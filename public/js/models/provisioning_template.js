chorus.models.ProvisioningTemplate = chorus.models.Base.extend({
    constructorName: "ProvisioningTemplate",
    nameAttribute: "name",

    toText: function() {
        return _.capitalize(this.name()) + " - " + this.get("cpuNumber") + " vcpu, " + this.get("memorySize") + " GB RAM";
    }
});