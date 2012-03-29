chorus.models.TabularDataAnalyze = chorus.models.Base.extend({
    constructorName: "TabularDataAnalyze",
    urlTemplate: "data/{{instanceId}}/database/{{encodeOnce databaseName}}/schema/{{encodeOnce schemaName}}/{{metaType}}/{{encodeOnce objectName}}/analyze"
});
