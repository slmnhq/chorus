chorus.models.Dataset = chorus.models.Base.extend({
    initialize:function () {
        this._super("initialize", arguments);
        if (this.has("instance")) {
            this.entityId = [
                this.get("instance").id,
                this.get("databaseName"),
                this.get("schemaName"),
                this.get("objectType"),
                this.get("objectName")
            ].join("|");
        } else {
            this.entityId = this.get("id");
        }
        this.entityType = this.metaType();
        this.bind('invalidated', this.refetchAfterInvalidated, this);
    },

    // once an api becomes available for fetching a single dataset,
    // we should fetch only that model.
    refetchAfterInvalidated: function() {
        this.collection && this.collection.fetch()
    },

    urlTemplate: "workspace/{{workspace.id}}/dataset/{{entityId}}",

    showUrlTemplate:function () {
        return [
            "workspaces",
            this.get("workspace").id,
            this.get("type").toLowerCase(),
            this.get("objectType").toLowerCase(),
            this.get("objectName")
        ].join("/");
    },

    makeBoxplotTask: function(taskAttrs) {
        return new chorus.models.BoxplotTask({
            xAxis: taskAttrs.xAxis,
            yAxis: taskAttrs.yAxis,
            objectName: this.get("objectName"),
            workspaceId: this.get("workspace").id,
            datasetId: this.entityId
        });
    },

    makeFrequencyTask: function(taskAttrs) {
        return new chorus.models.FrequencyTask({
            yAxis: taskAttrs.yAxis,
            objectName: this.get("objectName"),
            workspaceId: this.get("workspace").id,
            datasetId: this.entityId
        });
    },

    makeHistogramTask: function(taskAttrs) {
        return new chorus.models.HistogramTask({
            bins: taskAttrs.bins,
            xAxis: taskAttrs.xAxis,
            objectName: this.get("objectName"),
            workspaceId: this.get("workspace").id,
            datasetId: this.entityId
        });
    },

    makeHeatmapTask: function(taskAttrs) {
        return new chorus.models.HeatmapTask({
            xBins: taskAttrs.xBins,
            yBins: taskAttrs.yBins,
            xAxis: taskAttrs.xAxis,
            yAxis: taskAttrs.yAxis,
            objectName: this.get("objectName"),
            workspaceId: this.get("workspace").id,
            datasetId: this.entityId
        });
    },

    makeTimeseriesTask: function(taskAttrs) {
        return new chorus.models.TimeseriesTask({
            xAxis: taskAttrs.xAxis,
            yAxis: taskAttrs.yAxis,
            aggregation: taskAttrs.aggregation,
            timeInterval: taskAttrs.timeInterval,
            objectName: this.get("objectName"),
            workspaceId: this.get("workspace").id,
            datasetId: this.entityId
        });
    },

    statistics:function () {
        return new chorus.models.DatasetStatistics({
            instanceId:this.get("instance").id,
            databaseName:this.get("databaseName"),
            schemaName:this.get("schemaName"),
            type:this.get("type"),
            objectType:this.get("objectType"),
            objectName:this.get("objectName")
        });
    },

    metaType:function () {
        return chorus.models.Dataset.metaTypeMap[this.get("objectType")] || "table";
    },

    iconUrl:function () {
        return "/images/" + chorus.models.Dataset.iconMap[this.get("type")][this.get("objectType")]
    },

    lastComment:function () {
        var comment = this.get("recentComment");
        return comment && new chorus.models.Comment({
            body:comment.text,
            author:comment.author,
            commentCreatedStamp:comment.timestamp
        });
    },

    preview: function() {
        if (!this._preview) {
            this._preview = new chorus.models.DatasetPreview({
                instanceId : this.get("instance").id,
                databaseName : this.get("databaseName"),
                schemaName : this.get("schemaName")
            });
            var objectName = this.get("objectName");
            if (this.metaType() == "table") {
                this._preview.set({tableName : objectName}, {silent : true});
            } else {
                this._preview.set({viewName : objectName}, {silent : true});
            }
        }

        return this._preview;
    }
}, {
    metaTypeMap:{
        "BASE_TABLE":"table",
        "VIEW":"view",
        "EXTERNAL_TABLE":"table",
        "MASTER_TABLE":"table"
    },

    iconMap:{
        "CHORUS_VIEW":{
            "":"view_large.png"
        },

        "SOURCE_TABLE":{
            "BASE_TABLE":"source_table_large.png",
            "EXTERNAL_TABLE":"source_table_large.png",
            "MASTER_TABLE":"source_table_large.png",
            "VIEW":"source_view_large.png"
        },

        "SANDBOX_TABLE":{
            "BASE_TABLE":"table_large.png",
            "EXTERNAL_TABLE":"table_large.png",
            "MASTER_TABLE":"table_large.png",
            "VIEW":"view_large.png",
            "HDFS_EXTERNAL_TABLE": "table_large.png"
        }
    }
});
