(function(ns) {
    ns.models.InstanceAccountSet = ns.models.Collection.extend({
        model : ns.models.InstanceAccount,
        urlTemplate : "instance/accountmap",

        users : function() {
            return this.map(function(model){
                var user = model.get("user");
                return user && new ns.models.User(user);
            });
        },

        additionalParams : function(){
            return ['instanceId=' + this.attributes.instanceId];
        }

    });
})(chorus);
