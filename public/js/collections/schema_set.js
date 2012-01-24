;(function(ns) {
    ns.models.SchemaSet = ns.models.Collection.extend({
        model : ns.models.Schema,
        urlTemplate : "instance/{{instanceId}}/database/{{databaseId}}/schema",

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
