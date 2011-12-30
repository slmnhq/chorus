;(function(ns) {
    ns.models.Provisioning = ns.models.Base.extend({
        urlTemplate : "provisioning/{{provisionerPluginName}}?type={{type}}"
    });
})(chorus);