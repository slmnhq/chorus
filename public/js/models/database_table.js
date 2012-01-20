(function(ns) {
    ns.models.DatabaseTable = chorus.models.Base.extend({
        urlTemplate : "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/table/{{name}}"
    });
})(chorus);