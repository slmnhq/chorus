chorus.models.HistogramTask = chorus.models.ChartTask.extend({
    chartType: "histogram",

    beforeSave: function() {
        this._super("beforeSave", arguments);
        this.set({ 'chart[yAxis]': this.get("yAxis") });
    }
});

