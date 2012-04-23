chorus.collections.ProvisioningTemplateSet = chorus.collections.Base.extend({
    constructorName: "ProvisioningTemplateSet",
    model: chorus.models.ProvisioningTemplate,
    urlTemplate:"provisioning/{{provisionerPluginName}}?type=template"
});