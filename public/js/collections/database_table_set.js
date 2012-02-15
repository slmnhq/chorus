chorus.collections.DatabaseTableSet = chorus.collections.DatabaseObjectSet.extend({
    model:chorus.models.DatabaseTable,

    urlTemplate:"data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/table"
});
