chorus.views.DatasetVisualizationFrequencySidebar = chorus.views.DatasetVisualizationSidebar.extend({
    className: "dataset_visualization_frequency_sidebar",

    additionalContext: function() {
        return {
            chartType: "frequency",
            allColumnNames: this.allColumnNames()
        }
    },

    chartOptions: function() {
        return {
            type: "frequency",
            name: this.model.get("objectName"),
            yAxis: this.$(".category select option:selected").text()
        }
    }
});