chorus.models.InstanceAccount = chorus.models.Base.extend({
    constructorName: "InstanceAccount",
    parameterWrapper: "account",

    urlTemplate:function (options) {
        var method = options && options.method;
        if (method === "update" || method === "delete") {
            return "instances/{{instance_id}}/accounts/{{id}}";
        } else if (method === "read" && this.get("userId") == chorus.session.user().id) {
            return "instances/{{instance_id}}/my_account"
        } else {
            return "instances/{{instance_id}}/accounts";
        }
    },

    user:function () {
        return this.get("owner") && new chorus.models.User(this.get('owner'));
    },

    declareValidations:function (newAttrs) {
        this.require('db_username', newAttrs);

        if (this.isNew() || (newAttrs && newAttrs.hasOwnProperty('db_password'))) {
            this.require('db_password', newAttrs);
        }
    },

    attrToLabel: {
        "db_username":"instances.permissions.username",
        "db_password":"instances.permissions.password"
    }
}, {
    findByInstanceId:function (instance_id) {
        var account = new chorus.models.InstanceAccount({ instance_id:instance_id });
        account.fetch();
        return account;
    }
});
