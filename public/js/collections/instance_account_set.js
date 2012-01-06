(function(ns) {
    ns.models.InstanceAccountSet = ns.models.Collection.extend({
        model : ns.models.InstanceAccount,
        urlTemplate : "instance/accountmap",

        users : function() {
            return this.map(function(model) { return model.user(); });
        },

        additionalParams : function(){
            return ['instanceId=' + this.attributes.instanceId];
        }

    });
})(chorus);
