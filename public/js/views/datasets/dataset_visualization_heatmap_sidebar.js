chorus.views.DatasetVisualizationHeatmapSidebar = chorus.views.DatasetVisualizationSidebar.extend({
    className:"dataset_visualization_heatmap_sidebar",

    postRender:function () {
        this._super('postRender');
        this.$(".category option:eq(1)").attr('selected', 'selected');
    },

    additionalContext:function () {
        return {
            numericColumns:this.numericColumns()
        }
    }
});