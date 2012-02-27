chorus.models.Dataset = chorus.models.TabularData.extend({
    urlTemplate: function() {
        var components = [
            "workspace",
            this.get("workspace").id,
            "dataset"
        ]

        if (this.get("id")) {
            components.push(this.get("id"))
        }

        return components.join("/");
    },

    showUrlTemplate: function() {
        return [
            "workspaces",
            this.get("workspaceId") || this.get("workspace").id,
            "datasets",
            this.get("id")
        ].join("/");
    },

    iconUrl: function() {
        var result = this._super("iconUrl", arguments);
        if (this.get('hasCredentials') === false) {
            result = result.replace(".png", "_locked.png");
        }
        return result;
    },

    makeBoxplotTask: function(taskAttrs) {
        return new chorus.models.BoxplotTask({
            xAxis: taskAttrs.xAxis,
            yAxis: taskAttrs.yAxis,
            dataset: this,
            bins : taskAttrs.bins
        });
    },

    makeFrequencyTask: function(taskAttrs) {
        return new chorus.models.FrequencyTask({
            yAxis: taskAttrs.yAxis,
            dataset: this,
            bins: taskAttrs.bins
        });
    },

    makeHistogramTask: function(taskAttrs) {
        return new chorus.models.HistogramTask({
            bins: taskAttrs.bins,
            xAxis: taskAttrs.xAxis,
            dataset: this
        });
    },

    makeHeatmapTask: function(taskAttrs) {
        return new chorus.models.HeatmapTask({
            xBins: taskAttrs.xBins,
            yBins: taskAttrs.yBins,
            xAxis: taskAttrs.xAxis,
            yAxis: taskAttrs.yAxis,
            dataset: this
        });
    },

    makeTimeseriesTask: function(taskAttrs) {
        return new chorus.models.TimeseriesTask({
            xAxis: taskAttrs.xAxis,
            yAxis: taskAttrs.yAxis,
            aggregation: taskAttrs.aggregation,
            timeInterval: taskAttrs.timeInterval,
            dataset: this,
            timeType: taskAttrs.timeType
        });
    },

    tableOrViewTranslationKey: function() {
        return "dataset.types." + this.metaType();
    },

    isChorusView: function() {
        return this.get("type") === "CHORUS_VIEW";
    },

    deriveChorusView: function() {
        var chorusView = new chorus.models.ChorusView({sourceObjectId: this.id});
        chorusView.sourceObject = this;
        return chorusView;
    },

    statistics: function() {
        var stats = this._super("statistics")

        if (this.isChorusView() && !stats.datasetId) {
            stats.set({ workspace: this.get("workspace")})
            stats.datasetId = this.get("id")
        }

        return stats;
    },

    columns: function(options) {
        var result = this._super('columns', arguments);
        result.attributes.workspaceId = this.get("workspace").id;
        return result;
    },

    hasOwnPage: function() {
        return true;
    }
});
