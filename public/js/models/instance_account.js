;(function(ns) {
    ns.models.InstanceAccount = chorus.models.Base.extend({
        urlTemplate: function(options) {
            var method = options && options.method,
                instanceId = this.urlParams && this.urlParams.instanceId;
            if (method === "read" && instanceId) {
                return "instance/accountmap";
            } else {
                return "instance/accountmap/{{id}}";
            }
        },

        declareValidations : function(newAttrs) {
            this.require('dbUserName', newAttrs);
        },

        attrToLabel : {
            "dbUserName" : "instances.permissions.username"
        }
    },
    {
        findByInstanceId : function(instanceId) {
            var account = new chorus.models.InstanceAccount();
            account.urlParams = { instanceId: instanceId };
            account.fetch();
            return account;
        }
    });
})(chorus);
