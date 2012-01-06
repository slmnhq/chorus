;
(function(ns) {
    ns.models.InstanceAccountSet = ns.models.Collection.extend({
        model : ns.models.InstanceAccount,
        urlTemplate : "instance/accountmap",

        additionalParams: function(options) {
            ['instanceId=' + this.attributes.instanceId];
        }
    });
})(chorus);