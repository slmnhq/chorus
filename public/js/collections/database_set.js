chorus.collections.DatabaseSet = chorus.collections.Base.include(
    chorus.Mixins.InstanceCredentials.model
).extend({
    model:chorus.models.Database,
    urlTemplate:"instance/{{instanceId}}/database",
    setup:function () {
        this.bind("reset", this.applyInstanceIdToDatabases, this);
    },

    applyInstanceIdToDatabases:function () {
        var id = this.attributes.instanceId;
        this.each(function (db) {
            db.attributes.instanceId = id;
        });
    },

    parse:function (data) {
        if (data.resource.length && data.resource[0].databaseList) {
            data.resource = data.resource[0].databaseList;
        }

        return this._super('parse', [data]);
    }
});
