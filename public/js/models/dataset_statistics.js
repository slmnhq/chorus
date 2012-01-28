chorus.models.DatasetStatistics = chorus.models.Base.extend({
    urlTemplate:function () {
        return "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}"
    },

    urlParams:function () {
        return {
            type:"meta",
            filter:this.get("objectName")
        }
    }
});