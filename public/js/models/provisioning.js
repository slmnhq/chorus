chorus.models.Provisioning = chorus.models.Base.extend({
    urlTemplate:"provisioning/{{provisionerPluginName}}?type={{type}}",

    isInstalled:function () {
        return this.get("installationStatus") === "install_succeed";
    },

    // Stub out fetch since Aurora is not enabled for EAP
    fetch: function() {
        this.loaded = true;
        this.set({installationStatus: "not-installed"}, {silent: true});
        this.trigger("loaded");
    }
});