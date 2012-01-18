;(function(ns) {
    ns.models.InstanceAccount = ns.models.Base.extend({
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
            } else {
                return {};
            }
        },

        user: function() {
            return this.get("user") && new ns.models.User(this.get('user'));
        },

        declareValidations : function(newAttrs) {
            var shared = newAttrs && newAttrs.hasOwnProperty("shared") ? newAttrs["shared"] : this.get("shared");

            if (shared === this.previous("shared")) {
                this.require('dbUserName', newAttrs);
            }

            if (this.isNew() || (newAttrs && newAttrs.hasOwnProperty('dbPassword'))) { this.require('dbPassword', newAttrs); }
        },

        attrToLabel : {
            "dbUserName" : "instances.permissions.username",
            "dbPassword" : "instances.permissions.password"
        }
    },
    {
        findByInstanceId : function(instanceId) {
            var account = new ns.models.InstanceAccount({ instanceId: instanceId });
            account.fetch();
            return account;
        }
    });
})(chorus);
