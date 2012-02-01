chorus.models.ChartTask = chorus.models.Task.extend({
    taskType: "getChartData",

    initialize: function(attrs) {
        this._super("initialize", arguments);
        this.set({ "chart[type]": this.chartType });
    },

    beforeSave: function() {
        this.set({ relation: "SELECT * FROM " + this.get("objectName") });
    }
});
