chorus.models.BoxplotTask = chorus.models.ChartTask.extend({
    chartType: "boxplot",
    columnLabels : {
        "bucket" : "dataset.visualization.boxplot.bucket",
        "minimum" : "dataset.visualization.boxplot.minimum",
        "median" : "dataset.visualization.boxplot.median",
        "maximum" : "dataset.visualization.boxplot.maximum",
        "percentage" : "dataset.visualization.boxplot.percentage",
        "1stquartile" : "dataset.visualization.boxplot.1stquartile",
        "3rdquartile" : "dataset.visualization.boxplot.3rdquartile"
    },

    beforeSave: function() {
        this._super("beforeSave");
        this.set({
            'chart[xAxis]': this.get("xAxis"),
            'chart[yAxis]': this.get("yAxis")
        });
    }
});
