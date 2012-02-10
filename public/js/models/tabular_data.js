chorus.models.TabularData = chorus.models.Base.extend({
    initialize: function() {
        if (this.has("id")) {
            this.entityId = this.get("id");
        } else if (this.has("instance")) {
            //TODO: Remove after API story is done: https://www.pivotaltracker.com/story/show/24741875
            this.entityId = [
                this.get("instance").id,
                this.get("databaseName"),
                this.get("schemaName"),
                this.get("objectType"),
                this.get("objectName")
            ].join("|");
        }

        this.entityType = this.getEntityType();
        this.bind('invalidated', this.refetchAfterInvalidated, this);
    },

    getEntityType: function() {
        return this.constructor.entityTypeMap[this.get("type")] || "databaseObject"
    },

    metaType: function() {
        return this.constructor.metaTypeMap[this.get("objectType")] || "table";
    },

    schema: function() {
        return new chorus.models.Schema({
            instanceId: this.get("instance").id,
            databaseName: this.get("databaseName"),
            name: this.get("schemaName")
        });
    },

    statistics: function() {
        if (!this._statistics) {
            this._statistics = new chorus.models.DatabaseObjectStatistics({
                instanceId: this.has("instance") ? this.get("instance").id : this.collection.attributes.instanceId,
                databaseName: this.get("databaseName"),
                schemaName: this.get("schemaName"),
                type: this.get("type"),
                objectType: this.get("objectType"),
                objectName: this.get("objectName")
            });
        }

        return this._statistics;
    },

    iconUrl: function() {
        return "/images/" + this.constructor.iconMap[this.get("type")][this.get("objectType")]
    },

    lastComment: function() {
        var comment = this.get("recentComment");
        return comment && new chorus.models.Comment({
            body: comment.text,
            author: comment.author,
            commentCreatedStamp: comment.timestamp
        });
    },

    preview: function() {
        if (!this._preview) {
            this._preview = new chorus.models.DatabaseObjectPreview({
                instanceId: this.get("instance").id,
                databaseName: this.get("databaseName"),
                schemaName: this.get("schemaName")
            });
            var objectName = this.get("objectName");
            if (this.metaType() == "table") {
                this._preview.set({tableName: objectName}, {silent: true});
            } else {
                this._preview.set({viewName: objectName}, {silent: true});
            }
        }

        return this._preview;
    },

    refetchAfterInvalidated: function() {
        this.collection && this.fetch()
    }
}, {

    metaTypeMap: {
        "BASE_TABLE": "table",
        "VIEW": "view",
        "EXTERNAL_TABLE": "table",
        "MASTER_TABLE": "table",
        "CHORUS_VIEW": "view",
        "QUERY": "query"
    },

    entityTypeMap: {
        "SOURCE_TABLE": "databaseObject",
        "SANDBOX_TABLE": "databaseObject",
        "CHORUS_VIEW": "chorusView"
    },

    iconMap: {
        "CHORUS_VIEW": {
            "QUERY": "view_large.png"
        },

        "SOURCE_TABLE": {
            "BASE_TABLE": "source_table_large.png",
            "EXTERNAL_TABLE": "source_table_large.png",
            "MASTER_TABLE": "source_table_large.png",
            "VIEW": "source_view_large.png",
            "HDFS_EXTERNAL_TABLE": "source_table_large.png"
        },

        "SANDBOX_TABLE": {
            "BASE_TABLE": "table_large.png",
            "EXTERNAL_TABLE": "table_large.png",
            "MASTER_TABLE": "table_large.png",
            "VIEW": "view_large.png",
            "HDFS_EXTERNAL_TABLE": "table_large.png"
        }
    }
});