chorus.views.DatasetVisualizationHeatmapSidebar = chorus.views.DatasetVisualizationSidebar.extend({
    className:"dataset_visualization_heatmap_sidebar",

    postRender:function () {
        this._super('postRender');
        this.$(".x_axis option:eq(1)").attr('selected', 'selected');
        this.$(".y_axis option:eq(1)").attr('selected', 'selected');
    },

    chartOptions: function() {
        return {
            type: "heatmap",
            name: this.model.get("objectName"),
            xAxis: this.$(".x_axis select option:selected").text(),
            yAxis: this.$(".y_axis select option:selected").text(),
            xBins: this.$(".x_axis .selected_value").text(),
            yBins: this.$(".y_axis .selected_value").text()
        }    
    },
    
    additionalContext:function () {
        return {
            numericColumnNames:this.numericColumnNames()
        }
    }
});