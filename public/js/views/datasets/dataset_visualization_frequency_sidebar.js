chorus.views.DatasetVisualizationFrequencySidebar = chorus.views.DatasetVisualizationSidebar.extend({
    className: "dataset_visualization_frequency_sidebar",

    additionalContext: function() {
        return {
            chartType: "frequency",
            allColumnNames: this.allColumnNames()
        }
    }
});