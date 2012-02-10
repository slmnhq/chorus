chorus.models.Dataset = chorus.models.TabularData.extend({
    urlTemplate: "workspace/{{workspace.id}}/dataset/{{entityId}}",

    showUrlTemplate:function () {
        return [
            "workspaces",
            this.get("workspace").id,
            this.get("type").toLowerCase(),
            this.entityId
        ].join("/");
    },

    makeBoxplotTask: function(taskAttrs) {
        return new chorus.models.BoxplotTask({
            xAxis: taskAttrs.xAxis,
            yAxis: taskAttrs.yAxis,
            objectName: this.get("objectName"),
            workspaceId: this.get("workspace").id,
            datasetId: this.entityId,
            bins : taskAttrs.bins
        });
    },

    makeFrequencyTask: function(taskAttrs) {
        return new chorus.models.FrequencyTask({
            yAxis: taskAttrs.yAxis,
            objectName: this.get("objectName"),
            workspaceId: this.get("workspace").id,
            datasetId: this.entityId,
            bins: taskAttrs.bins
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

    tableOrViewTranslationKey: function() {
        return "dataset.types." + this.metaType();
    }
});
