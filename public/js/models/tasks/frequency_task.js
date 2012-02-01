chorus.models.FrequencyTask = chorus.models.ChartTask.extend({
    chartType: 'frequency',

    beforeSave: function() {
        this._super("beforeSave");
        this.set({ 'chart[yAxis]': this.get("yAxis") });
    }
});
