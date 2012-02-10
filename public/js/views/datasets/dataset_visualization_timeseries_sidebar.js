chorus.views.DatasetVisualizationTimeSeriesSidebar = chorus.views.DatasetVisualizationSidebar.extend({
    className: "dataset_visualization_timeseries_sidebar",

    postRender: function() {
        this._super('postRender');
        this.$(".category option:eq(1)").attr('selected', 'selected');
    },

    chartOptions: function() {
        var aggMap = {}
        _.each(["sum", "min", "max", "avg", "count"], function(name){
            aggMap[t("dataset.group."+name)] = name;
        })

        var xAxis = this.$(".time select option:selected").text();
        var timeColumn = (_.filter(this.columns, function(column){
            return column.get("name") === xAxis;
        }))[0];

        return {
            type: "timeseries",
            name: this.model.get("objectName"),
            xAxis: xAxis,
            yAxis: this.$(".value select option:selected").text(),
            aggregation: aggMap[this.$(".value .selected_value").text()],
            timeInterval: this.$(".time .selected_value").text(),
            timeType: timeColumn.get("typeCategory").toLowerCase()
        }
    },

    additionalContext: function() {
        return {
            numericColumnNames: this.numericColumnNames(),
            datetimeColumnNames: this.datetimeColumnNames(),
            dataGroupingChoices: _.map(["sum", "min", "max", "avg", "count"], function(name) {
                return t("dataset.group." + name);
            }),
            dateTimeIntervals: _.map(["minute","hour","day","week","month","year"], function(name) {
                return t("time." + name);
            })
        }
    }
});