chorus.models.Provisioning = chorus.models.Base.extend({
    constructorName: "Provisioning",
    urlTemplate:"provisioning",

    isInstalled:function () {
        return this.get("installSucceed") ;
    },

    getTemplates: function () {
        return _.map(this.get("templates"), function (template) {
            return new chorus.models.ProvisioningTemplate(template);
        });
    }
});
