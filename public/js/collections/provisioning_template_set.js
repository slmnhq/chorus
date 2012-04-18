chorus.collections.ProvisioningTemplateSet = chorus.collections.Base.extend({
    constructorName: "ProvisioningTemplateSet",
    modelClass: "ProvisioningTemplate",
    urlTemplate:"provisioning/{{provisionerPluginName}}?type=template"
});