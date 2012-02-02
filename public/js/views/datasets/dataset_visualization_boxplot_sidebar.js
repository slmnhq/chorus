chorus.views.DatasetVisualizationBoxplotSidebar = chorus.views.DatasetVisualizationSidebar.extend({
    className: "dataset_visualization_boxplot_sidebar",

    postRender: function() {
        this._super('postRender');
        this.$(".category option:eq(1)").attr('selected', 'selected');
        this.$("button.create").focus();
    },

    additionalContext: function() {
        return {
            chartType: "boxplot",            
            numericColumns: this.numericColumns(),
            allColumns: this.allColumns()
        }
    }
});