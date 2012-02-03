chorus.views.DatasetVisualizationTimeSeriesSidebar = chorus.views.DatasetVisualizationSidebar.extend({
    className: "dataset_visualization_timeseries_sidebar",

    postRender: function() {
        this._super('postRender');
        this.$(".category option:eq(1)").attr('selected', 'selected');
    },

    additionalContext: function() {
        return {
            numericColumns: this.numericColumns(),
            datetimeColumns: this.datetimeColumns(),
            dataGroupingChoices: _.map(["sum", "min", "max", "average", "count"], function(name) {
                return t("dataset.group." + name);
            }),
            dateTimeIntervals: _.map(["minute","hour","day","week","month","year"], function(name) {
                return t("time." + name);
            })
        }
    }
});