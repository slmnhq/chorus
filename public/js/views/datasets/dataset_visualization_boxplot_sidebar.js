chorus.views.DatasetVisualizationBoxplotSidebar = chorus.views.DatasetVisualizationSidebar.extend({
    className: "dataset_visualization_boxplot_sidebar",

    postRender: function() {
        this._super('postRender');
        this.$(".category option:eq(1)").attr('selected', 'selected');
    },

    chartOptions: function() {
        return {
            type: "boxplot",
            name: this.model.get("objectName"),
            xAxis: this.$(".category select option:selected").text(),
            yAxis: this.$(".value select option:selected").text(),
            bins: this.$(".limiter .selected_value").text()
        }
    },

    additionalContext: function() {
        return {
            numericColumnNames: this.numericColumnNames(),
            allColumnNames: this.allColumnNames()
        }
    }
});