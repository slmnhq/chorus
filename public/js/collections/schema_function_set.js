(function(ns) {
    ns.SchemaFunctionSet = ns.Collection.extend({
        model : ns.SchemaFunction,
        urlTemplate : "instance/{{instanceId}}/database/{{databaseId}}/schema/{{schemaId}}/function"
    });
})(chorus.models);