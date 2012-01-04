;(function(ns) {
    ns.models.SchemaSet = ns.models.Collection.extend({
        model : ns.models.Schema,
        urlTemplate : "instance/{{instanceId}}/database/{{databaseId}}/schema"
    });
})(chorus);
