;(function(ns) {
    ns.collections.SchemaSet = ns.collections.Base.extend({
        model : ns.models.Schema,
        urlTemplate : "instance/{{instanceId}}/database/{{databaseId}}/schema",

        comparator : function(schema) {
            return schema.get('name').toLowerCase();
        },

        parse: function(resp) {
            var resource = this._super("parse", arguments)
            return _.map(resource, function(model) {
                return _.extend({
                    instanceId: this.attributes.instanceId,
                    databaseId: this.attributes.databaseId,
                    databaseName: this.attributes.databaseName
                }, model)
            }, this)
        }
    });
})(chorus);
