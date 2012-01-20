(function(ns) {
    ns.models.DatabaseView = chorus.models.Base.extend({
        urlTemplate : "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/view/{{name}}"
    });
})(chorus);