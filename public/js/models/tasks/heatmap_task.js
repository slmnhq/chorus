chorus.models.HeatmapTask = chorus.models.ChartTask.extend({
    chartType: "heatmap",

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

