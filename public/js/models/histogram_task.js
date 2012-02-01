chorus.models.HistogramTask = chorus.models.Base.extend({
    urlTemplate: "task/sync/",

    initialize: function() {
        this.set({ "chart[type]": "histogram", taskType: "getChartData" });
    },

    beforeSave: function() {
        this.set({
            'chart[xAxis]': this.get("xAxis"),
            'chart[yAxis]': this.get("yAxis"),
            relation: "SELECT * FROM " + this.get("objectName")
        });
    }
});

