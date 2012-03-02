chorus.models.ChartTask = chorus.models.Task.extend({
    taskType: "getChartData",

    initialize: function(attrs) {
        this.tabularData = attrs.tabularData;
        this.set({
            datasetId: this.tabularData.get("id")
        }, {silent: true});
        if (this.tabularData.get("workspace")) {
            this.set({
                workspaceId: this.tabularData.get("workspace").id,
            }, {silent: true});
        }
        this.unset("tabularData");
        this._super("initialize", arguments);
        this.set({ "chart[type]": this.chartType });
    },

    beforeSave: function() {
        var relation = "SELECT * FROM ";

        relation += this.tabularData.fromClause();

        if (this.get("filters")) {
            relation += " " + this.get("filters");
        }

        this.set({ relation: relation });
    },

    getColumnLabel: function(columnName) {
        return this.columnLabels[columnName] ? t(this.columnLabels[columnName]) : columnName;
    }
});
