;(function(ns){
    ns.models.Dataset = ns.models.Base.extend({
        urlTemplate: "workspace/{{workspaceId}}/dataset/{{datasetId}}",

        statistics : function() {
            return new ns.models.DatasetStatistics({
                instanceId : this.get("instance").id,
                databaseName : this.get("databaseName"),
                schemaName : this.get("schemaName"),
                type : this.get("type"),
                objectType : this.get("objectType"),
                objectName : this.get("objectName")
            });
        }
    });
})(chorus);
