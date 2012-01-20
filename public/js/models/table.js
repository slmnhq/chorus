(function(ns) {
    ns.models.Table = chorus.models.Base.extend({
        urlTemplate : "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/table/{{name}}"
    });
})(chorus);