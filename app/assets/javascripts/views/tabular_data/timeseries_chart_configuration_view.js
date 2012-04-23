chorus.views.TimeseriesChartConfiguration = chorus.views.ChartConfiguration.extend({
    templateName: "chart_configuration",
    additionalClass: "timeseries",

    postRender: function() {
        this.$(".category option:eq(1)").attr('selected', 'selected');
        this._super('postRender');
    },

    columnGroups: [
        {
            name: "value",
            type: "numeric",
            options: {
                key: "dataset.visualization.sidebar.group_by",
                values: _.map(["sum", "min", "max", "avg", "count"], function(name) {
                    return t("dataset.group." + name);
                })
            }
        },
        {
            name: "time",
            type: "time",
            options: {
                key: "dataset.visualization.sidebar.interval",
                values: _.map(["minute","hour","day","week","month","year"], function(name) {
                    return t("time." + name);
                })
            }
        }
    ],

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
    }
});
