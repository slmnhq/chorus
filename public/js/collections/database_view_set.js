chorus.collections.DatabaseViewSet = chorus.collections.DatabaseObjectSet.extend({
    model:chorus.models.DatabaseView,
    urlTemplate:"data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/view"
});
