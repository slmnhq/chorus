(function(ns) {
    ns.models.DatabaseViewSet = ns.models.Collection.extend({
        model : ns.models.DatabaseView,
        urlTemplate : "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/view"
    });
})(chorus);
