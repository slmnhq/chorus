(function(ns) {
    ns.SchemaFunctionSet = ns.Collection.extend({
        model : ns.SchemaFunction,
        urlTemplate : "instance/{{instanceId}}/database/{{databaseId}}/schema/{{schemaId}}/function",

        comparator : function(schemaFunction) {
            return schemaFunction.get('functionName').toLowerCase();
        }

    });
})(chorus.models);