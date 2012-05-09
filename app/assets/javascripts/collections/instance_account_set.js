chorus.collections.InstanceAccountSet = chorus.collections.Base.extend({
    model: chorus.models.InstanceAccount,
    urlTemplate: "instances/{{instance_id}}/members",

    users: function() {
        return this.map(function(model) {
            return model.user();
        });
    },

    urlParams: function() {
        return {
            instance_id: this.attributes.instance_id
        }
    },

    comparator: function(account) {
        var name = account.user() && (account.user().get("last_name") + account.user().get("first_name"));
        name = name ? name.toLowerCase() : '\uFFFF'  //'FFFF' should be the last possible unicode character
        return name;
    }
});