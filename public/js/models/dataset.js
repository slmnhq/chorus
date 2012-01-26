;(function(ns){
    ns.models.Dataset = ns.models.Base.extend({
        showUrlTemplate : function() {
            var urlType = this.get("objectType").match(/TABLE/i) ? 'table' : 'view';
            return "workspaces/" + this.get("workspace").id + "/"+ urlType + "/{{objectName}}";
        },

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
