chorus.models.FrequencyTask = chorus.models.ChartTask.extend({
    chartType: 'frequency',
    columnLabels : {
        bucket: "dataset.visualization.frequency.bucket",
        count: "dataset.visualization.frequency.count"
    },

    beforeSave: function() {
        this._super("beforeSave");
        this.set({ 'chart[yAxis]': this.get("yAxis") });
    }
});
