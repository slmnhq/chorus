chorus.models.HistogramTask = chorus.models.ChartTask.extend({
    chartType: "histogram",
    columnLabels : {
        "frequency" : "dataset.visualization.histogram.frequency",
        "bin" : "dataset.visualization.histogram.bin"
    },

    beforeSave: function() {
        this._super("beforeSave", arguments);
        this.set({
            'chart[xAxis]': this.get("xAxis"),
            'chart[bins]': this.get("bins")
        });
    }
});

