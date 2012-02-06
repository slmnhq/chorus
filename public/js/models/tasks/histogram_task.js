chorus.models.HistogramTask = chorus.models.ChartTask.extend({
    chartType: "histogram",

    beforeSave: function() {
        this._super("beforeSave", arguments);
        this.set({
            'chart[xAxis]': this.get("xAxis"),
            'chart[bins]': this.get("bins")
        });
    }
});

