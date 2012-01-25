(function(ns) {
    ns.collections.DatabaseViewSet = ns.collections.DatabaseTableSet.extend({
        model : ns.models.DatabaseView,
        urlTemplate : "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/view"
    });
})(chorus);
