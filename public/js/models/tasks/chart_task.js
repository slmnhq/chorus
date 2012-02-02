chorus.models.ChartTask = chorus.models.Task.extend(_.extend({}, chorus.Mixins.SQLResults, {
    taskType: "getChartData",

    initialize: function(attrs) {
        this._super("initialize", arguments);
        this.set({ "chart[type]": this.chartType });
    },

    beforeSave: function() {
        this.set({ relation: "SELECT * FROM " + this.get("objectName") });
    },

    getColumnLabel: function(columnName) {
        return this.columnLabels[columnName] ? t(this.columnLabels[columnName]) : columnName;
    }
}));
