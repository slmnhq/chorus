chorus.models.DatabaseObjectStatistics = chorus.models.Base.extend({
    constructorName: "DatabaseObjectStatistics",
    urlTemplate:function () {
        if (this.datasetId) {
            return "workspace/{{workspace.id}}/dataset/" + encodeURIComponent(this.datasetId);
        } else {
            return "data/{{instance_id}}/database/{{encode databaseName}}/schema/{{encode schemaName}}/{{metaType}}/{{encode objectName}}"
        }
    }
});