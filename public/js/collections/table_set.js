(function(ns) {
    ns.models.TableSet = ns.models.Collection.extend({
        model : ns.models.Table,
        urlTemplate : "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/table"
    });
})(chorus);
