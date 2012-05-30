chorus.models.ChartTask = chorus.models.Task.extend({
    constructorName: "ChartTask",
    taskType: "getChartData",

    name: function() {
        return t("dataset.visualization.data.filename");
    },

    initialize: function(attrs) {
        this.tabularData = attrs.tabularData;
        this.set({
            datasetId: this.tabularData.get("id")
        }, {silent: true});
        if (this.tabularData.get("workspace")) {
            this.set({
                workspaceId: this.tabularData.get("workspace").id
            }, {silent: true});
        }
        this.unset("tabularData");
        this._super("initialize", arguments);
        this.set({ "chart[type]": this.chartType });
    },

    workspace: function() {
        if (this.get("workspaceId")) {
            this._workspace || (this._workspace = new chorus.models.Workspace({ id: this.get("workspaceId") }));
            return this._workspace;
        }
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
