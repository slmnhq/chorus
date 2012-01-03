;
(function(ns) {
    ns.models.Accountmap = chorus.models.Base.extend({
        urlTemplate: function() {
            if (this.urlParams && this.urlParams.instanceId) {
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
            var accountMap = new chorus.models.Accountmap();
            accountMap.urlParams = { instanceId: instanceId };
            accountMap.fetch();
            return accountMap;
        }
    });
})(chorus);
