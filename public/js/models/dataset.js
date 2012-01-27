;
(function(ns) {
    ns.models.Dataset = ns.models.Base.extend({
        showUrlTemplate : function() {
            return [
                "workspaces",
                this.get("workspace").id,
                this.get("type").toLowerCase(),
                this.get("objectType").toLowerCase(),
                this.get("objectName")
            ].join("/");
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
        },
        metaType : function() {
            return ns.models.Dataset.metaTypeMap[this.get("objectType")]
        }
    }, {
        metaTypeMap : {
            "BASE_TABLE" : "table",
            "VIEW" : "view",
            "EXTERNAL_TABLE" : "table",
            "MASTER_TABLE" : "table"
        }
    });
})
    (chorus);
