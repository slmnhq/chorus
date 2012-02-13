chorus.models.DatabaseObjectStatistics = chorus.models.Base.extend({
    urlTemplate:function () {
        if (this.datasetId) {
            return "workspace/{{workspace.id}}/dataset/" + this.datasetId;
        } else {
            return "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}"
        }
    },

    urlParams:function () {
        if (this.datasetId) {
            return {};
        } else {
            return {
                type:"meta",
                filter:this.get("objectName")
            }
        }
    }
});