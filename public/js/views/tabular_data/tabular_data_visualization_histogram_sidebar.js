chorus.views.TabularDataVisualizationHistogramSidebar = chorus.views.TabularDataVisualizationSidebar.extend({
    className: "tabular_data_visualization_histogram_sidebar",

    chartOptions: function() {
        return {
            type: "histogram",
            name: this.model.get("objectName"),
            xAxis: this.$(".category select option:selected").text(),
            bins: this.$(".limiter .selected_value").text()
        }
    },

    additionalContext: function() {
        return {
            chartType: "histogram",
            numericColumnNames: this.numericColumnNames()
        }
    }
});