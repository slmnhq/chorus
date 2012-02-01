chorus.views.DatasetVisualizationBoxplotSidebar = chorus.views.DatasetVisualizationSidebar.extend({
    className: "dataset_visualization_boxplot_sidebar",

    postRender: function() {
        this.$(".category option:eq(1)").attr('selected', 'selected');
        chorus.styleSelect(this.$('select'));
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