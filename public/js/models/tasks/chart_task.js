chorus.models.ChartTask = chorus.models.Task.extend({
    taskType: "getChartData",

    initialize: function(attrs) {
        this._super("initialize", arguments);
        this.set({ "chart[type]": this.chartType });
    },

    beforeSave: function() {
        this.set({ relation: "SELECT * FROM " + this.get("objectName") });
    },

    columnOrientedData: function() {
        var rows = this.get("rows");
        var columns = this.get("columns");

        return _.map(columns, function (column) {
            var name = column.name;
            return {
                name:name,
                type:column.typeCategory,
                values:_.pluck(rows, name)
            };
        });
    }
});
