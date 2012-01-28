chorus.collections.DatabaseViewSet = chorus.collections.DatabaseTableSet.extend({
    model:chorus.models.DatabaseView,
    urlTemplate:"data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/view"
});