chorus.models.ChartTask = chorus.models.Task.extend({
    taskType: "getChartData",

    initialize: function(attrs) {
        this.dataset = attrs.dataset;
        this.set({
            workspaceId: this.dataset.get("workspace").id,
            datasetId: this.dataset.get("id")
        }, {silent: true});
        this.unset("dataset");
        this._super("initialize", arguments);
        this.set({ "chart[type]": this.chartType });
    },

    beforeSave: function() {
        var relation = "SELECT * FROM ";

        relation += this.dataset.fromClause();

        if (this.get("filters")) {
            relation += " " + this.get("filters");
        }

        this.set({ relation: relation });
    },

    getColumnLabel: function(columnName) {
        return this.columnLabels[columnName] ? t(this.columnLabels[columnName]) : columnName;
    }
});
