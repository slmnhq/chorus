chorus.models.BoxplotTask = chorus.models.ChartTask.extend({
    urlTemplate: "task/sync/",
    chartType: "boxplot",

    beforeSave: function() {
        this._super("beforeSave");
        this.set({
            'chart[xAxis]': this.get("xAxis"),
            'chart[yAxis]': this.get("yAxis")
        });
    }
});
