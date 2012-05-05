chorus.collections.DatabaseSet = chorus.collections.Base.include(
    chorus.Mixins.InstanceCredentials.model
).extend({
    model:chorus.models.Database,
    urlTemplate: "instances/{{instance_id}}/databases",
    showUrlTemplate: "instances/{{instance_id}}/databases",

    setup:function () {
        this.bind("reset", this.applyInstanceIdToDatabases, this);
    },

    applyInstanceIdToDatabases:function () {
        var id = this.attributes.instance_id;
        this.each(function (db) {
            db.attributes.instance_id = id;
        });
    },

    parse:function (data) {
        // TODO - remove the check for 'data.response' once we've converted
        // the #fail method to use the new format
        if (data.response && data.response.length && data.response[0].databaseList) {
            data.response = data.response[0].databaseList;
        }

        return this._super('parse', [data]);
    }
});
