chorus.collections.DatabaseSet = chorus.collections.Base.include(
    chorus.Mixins.InstanceCredentials.model
).extend({
    model:chorus.models.Database,
    urlTemplate: "instances/{{instanceId}}/databases",
    showUrlTemplate: "instances/{{instanceId}}/databases",

    setup:function () {
        this.bind("reset", this.applyInstanceIdToDatabases, this);
    },

    applyInstanceIdToDatabases:function () {
        var id = this.attributes.instanceId;
        this.each(function (db) {
            db.attributes.instanceId = id;
        });
    }
});
