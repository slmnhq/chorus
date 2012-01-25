;(function(ns){
    ns.models.DatasetStatistics = ns.models.Base.extend({
        urlTemplate: function(){
            var start = "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/"

            var type = this.get("type");
            var objectType = this.get("objectType");
            var isTable = ((type == "SOURCE_TABLE" || type == "SANDBOX_TABLE") && objectType != "VIEW");
            if (isTable) {
                return start + "table/{{objectName}}";
            } else {
                return start + "view/{{objectName}}"
            }
        }
    });
})(chorus);