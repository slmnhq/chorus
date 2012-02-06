chorus.models.HeatmapTask = chorus.models.ChartTask.extend({
    chartType: "heatmap",
    columnLabels : {
        x: "dataset.visualization.heatmap.x",
        y: "dataset.visualization.heatmap.y",
        value: "dataset.visualization.heatmap.value",
        xLabel: "dataset.visualization.heatmap.xLabel",
        yLabel: "dataset.visualization.heatmap.yLabel"
    },

    beforeSave: function() {
        this._super("beforeSave");
        this.set({
            'chart[xAxis]': this.get("xAxis"),
            'chart[yAxis]': this.get("yAxis"),
            'chart[xBins]': this.get("xBins"),
            'chart[yBins]': this.get("yBins")
        });
    }
});

