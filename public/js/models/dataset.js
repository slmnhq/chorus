;
(function(ns) {
    ns.models.Dataset = ns.models.Base.extend({
        initialize : function() {
            this._super("initialize", arguments);
            this.entityId = [
                this.get("instance").id,
                this.get("databaseName"),
                this.get("schemaName"),
                this.get("objectName")
            ].join("|");
            this.entityType = this.metaType();
        },

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
        },

        iconUrl: function() {
            return "/images/" + chorus.models.Dataset.iconMap[this.get("type")][this.get("objectType")]
        },

        lastComment : function() {
            var comment = this.get("recentComment");
            return comment && new ns.models.Comment({
                body : comment.text,
                author : comment.author,
                commentCreatedStamp : comment.timestamp
            });
        }
    }, {
        metaTypeMap : {
            "BASE_TABLE" : "table",
            "VIEW" : "view",
            "EXTERNAL_TABLE" : "table",
            "MASTER_TABLE" : "table"
        },

        iconMap : {
            "CHORUS_VIEW" : {
                "" : "view_large.png"
            },

            "SOURCE_TABLE" : {
                "BASE_TABLE" : "source_table_large.png",
                "EXTERNAL_TABLE" : "source_table_large.png",
                "MASTER_TABLE" : "source_table_large.png",
                "VIEW" : "source_view_large.png"
            },

            "SANDBOX_TABLE" : {
                "BASE_TABLE" : "table_large.png",
                "EXTERNAL_TABLE" : "table_large.png",
                "MASTER_TABLE" : "table_large.png",
                "VIEW" : "view_large.png"
            }
        }
    });
})
    (chorus);
