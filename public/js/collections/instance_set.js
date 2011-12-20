;(function(ns){
    ns.models.InstanceSet = ns.models.Collection.extend({
        model : ns.models.Instance,
        urlTemplate : "instance/"
    });
})(chorus);