chorus.models.TabularData = chorus.models.Base.extend({
    initialize: function() {
        this.resetEntityType();
        this.bind("change:type", this.resetEntityType, this);
        this.bind('invalidated', this.refetchAfterInvalidated, this);
    },

    getEntityType: function() {
        return this.constructor.entityTypeMap[this.get("type")] || "databaseObject"
    },

    resetEntityType: function() {
        this.entityType = this.getEntityType();
    },

    metaType: function() {
        return this.constructor.metaTypeMap[this.get("objectType")] || "table";
    },

    columns:function () {
        if (!this._columns) {
            this._columns = new chorus.collections.DatabaseColumnSet([], {
                instanceId:this.get("instance").id,
                databaseName:this.get("databaseName"),
                schemaName:this.get("schemaName")
            });

            var objectNameField = this.metaType() + "Name";
            this._columns.attributes[objectNameField] = (this.metaType() == "query") ? this.get("id") : this.get("objectName");
        }
        return this._columns;
    },

    instance: function() {
        if(!this._instance) {
            this._instance = new chorus.models.Instance({
                id: this.get("instance").id,
                name: this.get("instance").name
            });
        }
        return this._instance;
    },

    schema: function() {
        return new chorus.models.Schema({
            instanceId: this.get("instance").id,
            databaseName: this.get("databaseName"),
            name: this.get("schemaName"),
            instanceName: this.get("instance").name
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

    iconUrl: function(options) {
        var size = (options && options.size) || "large";
        var name = this.constructor.iconMap[this.get("type")][this.get("objectType")];
        return "/images/" + name + "_" + size + ".png";
    },

    lastComment: function() {
        var comment = this.get("recentComment");
        return comment && new chorus.models.Comment({
            body: comment.text,
            author: comment.author,
            commentCreatedStamp: comment.timestamp
        });
    },

    preview: function(inEditChorusView) {
        if (!this._preview) {
            this._preview = new chorus.models.TabularDataPreview({
                instanceId: this.get("instance").id,
                databaseName: this.get("databaseName"),
                schemaName: this.get("schemaName")
            });
        }

        var objectName = this.get("objectName");
        var metaType = this.metaType();
        if (inEditChorusView) {
            this._preview.set({query: this.get("query"), workspaceId: this.get("workspace").id}, {silent: true});
        } else if (metaType == "table") {
            this._preview.set({tableName: objectName}, {silent: true});
        } else if (metaType == "view") {
            this._preview.set({viewName: objectName}, {silent: true});
        } else {
            this._preview.set({datasetId: this.get("id"), workspaceId: this.get("workspace").id}, {silent: true});
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
            "QUERY": "view"
        },

        "SOURCE_TABLE": {
            "BASE_TABLE": "source_table",
            "EXTERNAL_TABLE": "source_table",
            "MASTER_TABLE": "source_table",
            "VIEW": "source_view",
            "HDFS_EXTERNAL_TABLE": "source_table"
        },

        "SANDBOX_TABLE": {
            "BASE_TABLE": "table",
            "EXTERNAL_TABLE": "table",
            "MASTER_TABLE": "table",
            "VIEW": "view",
            "HDFS_EXTERNAL_TABLE": "table"
        }
    }
});
