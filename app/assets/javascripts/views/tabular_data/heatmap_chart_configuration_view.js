chorus.views.HeatmapChartConfiguration = chorus.views.ChartConfiguration.extend({
    templateName:"chart_configuration",
    additionalClass: "heatmap",

    postRender:function () {
        this.$(".x_axis option:eq(0)").attr('selected', 'selected');
        this.$(".y_axis option:eq(1)").attr('selected', 'selected');
        this._super('postRender');
    },

    columnGroups: [
        {
            name: "x_axis",
            type: "numeric",
            options: {
                key: "dataset.visualization.sidebar.number_of_bins"
            }
        },
        {
            name: "y_axis",
            type: "numeric",
            options: {
                key: "dataset.visualization.sidebar.number_of_bins"
            }
        }
    ],

    chartOptions: function() {
        return {
            type: "heatmap",
            name: this.model.get("objectName"),
            xAxis: this.$(".x_axis select option:selected").text(),
            yAxis: this.$(".y_axis select option:selected").text(),
            xBins: this.$(".x_axis .selected_value").text(),
            yBins: this.$(".y_axis .selected_value").text()
        };
    }
});
