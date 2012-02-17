chorus.models.Dataset = chorus.models.TabularData.extend({
    urlTemplate: "workspace/{{workspace.id}}/dataset/{{id}}",

    showUrlTemplate: function() {
        return [
            "workspaces",
            this.get("workspace").id,
            "datasets",
            this.get("id")
        ].join("/");
    },

    iconUrl: function() {
        var result = this._super("iconUrl");
        if (this.get('hasCredentials') === false) {
            result = result.replace(".png", "_locked.png");
        }
        return result;
    },

    makeBoxplotTask: function(taskAttrs) {
        return new chorus.models.BoxplotTask({
            xAxis: taskAttrs.xAxis,
            yAxis: taskAttrs.yAxis,
            objectName: this.get("objectName"),
            query: this.get("query"),
            workspaceId: this.get("workspace").id,
            datasetId: this.get("id"),
            bins : taskAttrs.bins
        });
    },

    makeFrequencyTask: function(taskAttrs) {
        return new chorus.models.FrequencyTask({
            yAxis: taskAttrs.yAxis,
            objectName: this.get("objectName"),
            query: this.get("query"),
            workspaceId: this.get("workspace").id,
            datasetId: this.get("id"),
            bins: taskAttrs.bins
        });
    },

    makeHistogramTask: function(taskAttrs) {
        return new chorus.models.HistogramTask({
            bins: taskAttrs.bins,
            xAxis: taskAttrs.xAxis,
            objectName: this.get("objectName"),
            query: this.get("query"),
            workspaceId: this.get("workspace").id,
            datasetId: this.get("id")
        });
    },

    makeHeatmapTask: function(taskAttrs) {
        return new chorus.models.HeatmapTask({
            xBins: taskAttrs.xBins,
            yBins: taskAttrs.yBins,
            xAxis: taskAttrs.xAxis,
            yAxis: taskAttrs.yAxis,
            objectName: this.get("objectName"),
            query: this.get("query"),
            workspaceId: this.get("workspace").id,
            datasetId: this.get("id")
        });
    },

    makeTimeseriesTask: function(taskAttrs) {
        return new chorus.models.TimeseriesTask({
            xAxis: taskAttrs.xAxis,
            yAxis: taskAttrs.yAxis,
            aggregation: taskAttrs.aggregation,
            timeInterval: taskAttrs.timeInterval,
            objectName: this.get("objectName"),
            query: this.get("query"),
            workspaceId: this.get("workspace").id,
            datasetId: this.get("id"),
            timeType: taskAttrs.timeType
        });
    },

    tableOrViewTranslationKey: function() {
        return "dataset.types." + this.metaType();
    },

    isChorusView: function() {
        return this.get("type") === "CHORUS_VIEW";
    },

    statistics: function() {
        var stats = this._super("statistics")

        if (this.isChorusView() && !stats.datasetId) {
            stats.set({ workspace: this.get("workspace")})
            stats.datasetId = this.get("id")
        }

        return stats;
    },

    columns: function(options) {
        var result = this._super('columns', arguments);
        result.attributes.workspaceId = this.get("workspace").id;
        return result;
    }
});
