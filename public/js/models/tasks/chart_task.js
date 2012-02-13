chorus.models.ChartTask = chorus.models.Task.extend({
    taskType: "getChartData",

    initialize: function(attrs) {
        this._super("initialize", arguments);
        this.set({ "chart[type]": this.chartType });
    },

    beforeSave: function() {
        var relation = "SELECT * FROM ";

        if (this.get("query")) {
            relation += "(" + this.get("query") + ") AS " + this.safePGName(this.get("objectName"));
        } else {
            relation += this.safePGName(this.get("objectName"));
        }

        if (this.get("filters")) {
            relation += " " + this.get("filters");
        }

        this.set({ relation: relation });
    },

    getColumnLabel: function(columnName) {
        return this.columnLabels[columnName] ? t(this.columnLabels[columnName]) : columnName;
    }
});
