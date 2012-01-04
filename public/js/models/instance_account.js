;(function(ns) {
    ns.models.InstanceAccount = chorus.models.Base.extend({
        urlTemplate: function(options) {
            var method = options && options.method;
            if (method === "update" || method === "delete") {
                return "instance/accountmap/{{id}}";
            } else {
                return "instance/accountmap";
            }
        },

        urlParams: function(options) {
            if (options && options.method === "read") {
                var params = { instanceId: this.get("instanceId") };
                if (this.get("userName")) { params["userName"] = this.get("userName") };
                return params;
            }
        },

        declareValidations : function(newAttrs) {
            this.require('dbUserName', newAttrs);
        },

        attrToLabel : {
            "dbUserName" : "instances.permissions.username",
            "dbPassword" : "instances.permissions.password"
        }
    },
    {
        findByInstanceId : function(instanceId) {
            var account = new chorus.models.InstanceAccount({ instanceId: instanceId });
            account.fetch();
            return account;
        }
    });
})(chorus);
