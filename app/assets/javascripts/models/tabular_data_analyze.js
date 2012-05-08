chorus.models.TabularDataAnalyze = chorus.models.Base.extend({
    constructorName: "TabularDataAnalyze",
    urlTemplate: "data/{{instance_id}}/database/{{encode databaseName}}/schema/{{encode schemaName}}/{{metaType}}/{{encode objectName}}/analyze"
});
