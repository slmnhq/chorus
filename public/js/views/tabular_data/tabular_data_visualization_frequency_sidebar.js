chorus.views.TabularDataVisualizationFrequencySidebar = chorus.views.TabularDataVisualizationSidebar.extend({
    constructorName: "TabularDataVisualizationFrequencySidebar",
    className: "tabular_data_visualization_sidebar",
    additionalClass: "frequency",

    columnGroups: [
        {
            type: "all",
            name: "category",
            options: true
        }
    ],

    chartOptions: function() {
        return {
            type: "frequency",
            name: this.model.get("objectName"),
            yAxis: this.$(".category select option:selected").text(),
            bins: this.$(".limiter .selected_value").text()
        }
    }
});
