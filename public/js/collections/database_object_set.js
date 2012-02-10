chorus.collections.DatabaseObjectSet = chorus.collections.Base.extend({
    model: chorus.models.DatabaseObject,
    urlTemplate: "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}",

    urlParams: function() {
        return {type: "meta"}
    }
});