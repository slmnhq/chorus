;
(function(ns) {
    ns.models.Accountmap = chorus.models.Base.extend({
        urlTemplate : "instance/accountmap/{{id}}",

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
            accountMap.fetch({url : '/edc/instance/accountmap?instanceId=' + instanceId})
            return accountMap;
        }
    });
})(chorus);
