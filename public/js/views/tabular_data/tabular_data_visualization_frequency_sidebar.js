chorus.views.TabularDataVisualizationFrequencySidebar = chorus.views.TabularDataVisualizationSidebar.extend({
    className: "tabular_data_visualization_frequency_sidebar",

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
            yAxis: this.$(".category select option:selected").text(),
            bins: this.$(".limiter .selected_value").text()
        }
    }
});