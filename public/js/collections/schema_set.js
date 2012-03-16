chorus.collections.SchemaSet = chorus.collections.Base.extend(_.extend({}, chorus.Mixins.InstanceCredentials.model, {
    constructorName: "SchemaSet",
    model:chorus.models.Schema,
    urlTemplate:"instance/{{instanceId}}/database/{{databaseName}}/schema",

    comparator:function (schema) {
        return schema.get('name').toLowerCase();
    },

    parse:function (resp) {
        var resource = this._super("parse", arguments)
        return _.map(resource, function (model) {
            return _.extend({
                instanceId:this.attributes.instanceId,
                databaseId:this.attributes.databaseId,
                databaseName:this.attributes.databaseName
            }, model)
        }, this)
    }
}));
