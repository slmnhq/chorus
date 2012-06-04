chorus.models.DatabaseObjectStatistics = chorus.models.Base.extend({
    constructorName: "DatabaseObjectStatistics",
    urlTemplate:function () {
        if (this.datasetId) {
            return "workspace/{{workspace.id}}/dataset/" + encodeURIComponent(this.datasetId);
        } else {
            return "tables/{{databaseObjectId}}/statistics"
        }
    }
});