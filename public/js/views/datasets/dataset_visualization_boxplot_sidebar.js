chorus.views.DatasetVisualizationBoxplotSidebar = chorus.views.DatasetVisualizationSidebar.extend({
    className: "dataset_visualization_boxplot_sidebar",

    postRender: function() {
        this._super('postRender');
        this.$(".category option:eq(1)").attr('selected', 'selected');
    },

    chartOptions: function() {
        return {
            name: "foo",
            type: "boxplot",
            xAxis: this.$(".value select option:selected").text(),
            yAxis: this.$(".category select option:selected").text()
        }
    },

    additionalContext: function() {
        return {
            numericColumns: this.numericColumns(),
            allColumns: this.allColumns()
        }
    }
});