chorus.views.TabularDataVisualizationBoxplotSidebar = chorus.views.TabularDataVisualizationSidebar.extend({
    className: "tabular_data_visualization_boxplot_sidebar",

    postRender: function() {
        this.$(".category option:eq(1)").attr('selected', 'selected');
        this._super('postRender');
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