chorus.models.DatabaseObjectStatistics = chorus.models.Base.extend({
    constructorName: "DatabaseObjectStatistics",
    urlTemplate:function () {
        if (this.datasetId) {
            return "workspace/{{workspace.id}}/dataset/" + this.datasetId;
        } else {
            return "data/{{instanceId}}/database/{{encodeOnce databaseName}}/schema/{{encodeOnce schemaName}}/{{metaType}}/{{encodeOnce objectName}}"
        }
    }
});