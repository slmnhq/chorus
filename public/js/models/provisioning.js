chorus.models.Provisioning = chorus.models.Base.extend({
    constructorName: "Provisioning",
    urlTemplate:"provisioning/{{provisionerPluginName}}?type={{type}}",

    isInstalled:function () {
        return this.get("installationStatus") === "install_succeed";
    }
});
