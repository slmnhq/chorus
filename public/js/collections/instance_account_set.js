(function(ns) {
    ns.models.InstanceAccountSet = ns.models.Collection.extend({
        model : ns.models.InstanceAccount,
        urlTemplate : "instance/accountmap",

        users : function() {
            var users = this.map(function(model){
                var user = model.get("user");
                return user && new ns.models.User(user);
            });
            return users;
        },

        additionalParams : function(){
            var params = []
            params.push("instanceId="+this.attributes.instanceId);
            return params;
        }

    });
})(chorus);
