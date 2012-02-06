chorus.models.ChartTask = chorus.models.Task.extend(_.extend({}, chorus.Mixins.SQLResults, {
    taskType: "getChartData",

    initialize: function(attrs) {
        this._super("initialize", arguments);
        this.set({ "chart[type]": this.chartType });
    },

    beforeSave: function() {
        var relation = "SELECT * FROM " + this.safePGName(this.get("objectName"));
        if (this.get("filters")) {
            relation += " " + this.get("filters");
        }
        this.set({ relation: relation });
    },

    getColumnLabel: function(columnName) {
        return this.columnLabels[columnName] ? t(this.columnLabels[columnName]) : columnName;
    }
}));
