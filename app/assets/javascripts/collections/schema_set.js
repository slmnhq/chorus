chorus.collections.SchemaSet = chorus.collections.Base.include(
    chorus.Mixins.InstanceCredentials.model
).extend({
    constructorName: "SchemaSet",
    model:chorus.models.Schema,
    urlTemplate:"instance/{{instance_id}}/database/{{encode databaseName}}/schema",

    comparator:function (schema) {
        return schema.get('name').toLowerCase();
    },

    parse:function (resp) {
        var resource = this._super("parse", arguments)
        return _.map(resource, function (model) {
            return _.extend({
                instance_id: this.attributes.instance_id,
                instanceName: this.attributes.instanceName,
                databaseId: this.attributes.databaseId,
                databaseName: this.attributes.databaseName
            }, model)
        }, this)
    }
});
