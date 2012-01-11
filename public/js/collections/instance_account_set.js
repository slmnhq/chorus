(function(ns) {
    ns.models.InstanceAccountSet = ns.models.Collection.extend({
        model : ns.models.InstanceAccount,
        urlTemplate : "instance/accountmap",

        users : function() {
            return this.map(function(model) { return model.user(); });
        },

        urlParams : function(){
            return {
                instanceId : this.attributes.instanceId
            }
        },

        comparator : function(account) {
            var name = account.user() && (account.user().get("lastName")+account.user().get("firstName"));
            name = name ? name.toLowerCase() : '\uFFFF'  //'FFFF' should be the last possible unicode character
            return name;
        }
    });
})(chorus);
