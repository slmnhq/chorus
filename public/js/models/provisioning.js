;(function(ns) {
    ns.models.Provisioning = ns.models.Base.extend({
        urlTemplate : "provisioning/{{provisionerPluginName}}?type={{type}}",

        isInstalled: function() {
            return this.get("installationStatus") === "install_succeed";
        }
    });
})(chorus);
