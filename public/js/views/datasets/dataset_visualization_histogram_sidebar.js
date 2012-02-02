chorus.views.DatasetVisualizationHistogramSidebar = chorus.views.DatasetVisualizationSidebar.extend({
    className: "dataset_visualization_histogram_sidebar",

    additionalContext: function() {
        return {
            chartType: "histogram",
            numericColumns: this.numericColumns()
        }
    }
});