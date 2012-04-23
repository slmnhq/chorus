chorus.models.TimeseriesTask = chorus.models.ChartTask.extend({
    chartType: "timeseries",
    columnLabels: {
        time: "dataset.visualization.timeseries.time",
        value: "dataset.visualization.timeseries.value"
    },

    beforeSave: function() {
        this._super("beforeSave");
        this.set({
            'chart[xAxis]': this.get("xAxis"),
            'chart[yAxis]': this.get("yAxis"),
            'chart[aggregation]': this.get("aggregation"),
            'chart[timeInterval]': this.get("timeInterval")
        });
    }
});

