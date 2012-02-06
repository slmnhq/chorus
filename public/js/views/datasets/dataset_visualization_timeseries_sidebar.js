chorus.views.DatasetVisualizationTimeSeriesSidebar = chorus.views.DatasetVisualizationSidebar.extend({
    className: "dataset_visualization_timeseries_sidebar",

    postRender: function() {
        this._super('postRender');
        this.$(".category option:eq(1)").attr('selected', 'selected');
    },

    chartOptions: function() {
        return {
            type: "timeseries",
            name: this.model.get("objectName"),
            xAxis: this.$(".time select option:selected").text(),
            yAxis: this.$(".value select option:selected").text(),
            aggregation: this.$(".value .selected_value").text(),
            timeInterval: this.$(".time .selected_value").text()
        }
    },

    additionalContext: function() {
        return {
            numericColumnNames: this.numericColumnNames(),
            datetimeColumnNames: this.datetimeColumnNames(),
            dataGroupingChoices: _.map(["sum", "min", "max", "average", "count"], function(name) {
                return t("dataset.group." + name);
            }),
            dateTimeIntervals: _.map(["minute","hour","day","week","month","year"], function(name) {
                return t("time." + name);
            })
        }
    }
});