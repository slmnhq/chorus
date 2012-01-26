;(function(ns){
    ns.models.InstanceUsage = ns.models.Base.extend({
        urlTemplate: "instance/{{instanceId}}/workspace"
    });
})(chorus);