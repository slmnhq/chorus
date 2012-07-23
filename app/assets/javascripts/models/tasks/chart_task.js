chorus.models.ChartTask = chorus.models.Task.extend({
    constructorName: "ChartTask",
    urlTemplateBase: 'datasets/{{datasetId}}/visualizations',

    name: function() {
        return t("dataset.visualization.data.filename");
    },

    initialize: function(attrs) {
        var dataset = attrs.dataset;
        if (dataset) {
            this.set({ datasetId: dataset.get("id") }, {silent: true});
        }
        this.unset("dataset");
        this._super("initialize", arguments);
        this.set({ "type": this.chartType });
    },

    getColumnLabel: function(columnName) {
        return this.columnLabels[columnName] ? t(this.columnLabels[columnName]) : columnName;
    }
});
