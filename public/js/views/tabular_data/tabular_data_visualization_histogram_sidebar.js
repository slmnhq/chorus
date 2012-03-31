chorus.views.TabularDataVisualizationHistogramSidebar = chorus.views.TabularDataVisualizationSidebar.extend({
    className: "tabular_data_visualization_sidebar",
    additionalClass: "histogram",

    columnGroups: [
        {
            name: "category",
            type: "numeric",
            options: {
                key: "dataset.visualization.sidebar.number_of_bins"
            }
        }
    ],

    chartOptions: function() {
        return {
            type: "histogram",
            name: this.model.get("objectName"),
            xAxis: this.$(".category select option:selected").text(),
            bins: this.$(".limiter .selected_value").text()
        }
    }
});
