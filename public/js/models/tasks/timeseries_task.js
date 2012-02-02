chorus.models.TimeseriesTask = chorus.models.ChartTask.extend({
    chartType: "timeseries",

    beforeSave: function() {
        this._super("beforeSave");
        this.set({
            'chart[xAxis]': this.get("xAxis"),
            'chart[yAxis]': this.get("yAxis")
        });
    }
});

