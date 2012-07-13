chorus.models.HeatmapTask = chorus.models.ChartTask.extend({
    chartType: "heatmap",
    columnLabels : {
        x: "dataset.visualization.heatmap.x",
        y: "dataset.visualization.heatmap.y",
        value: "dataset.visualization.heatmap.value",
        xLabel: "dataset.visualization.heatmap.xLabel",
        yLabel: "dataset.visualization.heatmap.yLabel"
    }
});
