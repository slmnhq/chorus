chorus.models.TabularDataAnalyze = chorus.models.Base.extend({
    constructorName: "TabularDataAnalyze",
    urlTemplate: "data/{{instanceId}}/database/{{encode databaseName}}/schema/{{encode schemaName}}/{{metaType}}/{{encode objectName}}/analyze"
});
