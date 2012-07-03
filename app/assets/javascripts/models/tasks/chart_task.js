chorus.models.ChartTask = chorus.models.Task.extend({
    urlTemplate: 'datasets/{{datasetId}}/visualizations',
    constructorName: "ChartTask",

    name: function() {
        return t("dataset.visualization.data.filename");
    },

    initialize: function(attrs) {
        this.dataset = attrs.dataset;
        this.set({
            datasetId: this.dataset.get("id")
        }, {silent: true});
        if (this.dataset.get("workspace")) {
            this.set({
                workspaceId: this.dataset.get("workspace").id
            }, {silent: true});
        }
        this.unset("dataset");
        this._super("initialize", arguments);
        this.set({ "type": this.chartType });
    },

    workspace: function() {
        if (this.get("workspaceId")) {
            this._workspace || (this._workspace = new chorus.models.Workspace({ id: this.get("workspaceId") }));
            return this._workspace;
        }
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
