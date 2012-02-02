chorus.dialogs.Visualization = chorus.dialogs.Base.extend({
    className : "visualization",

    subviews: {
        ".tabledata": "chartData",
        ".chart_area": "chart"
    },

    events: {
        "click a.show" : "showTabularData",
        "click a.hide" : "hideTabularData",
        "click button.close_dialog" : "closeModal"
    },

    setup : function() {
        this.model = this.options.model;
        this.type = this.options.chartOptions.type;
        this.title = t("visualization.title", {name: this.options.chartOptions.name});

        this.chartData = new chorus.views.ResultsConsole();
        var func = 'make' + _.capitalize(this.type) + 'Task';
        this.task = this.model[func](this.options.chartOptions);
        this.task.bind("saved", this.onExecutionComplete, this);
        this.task.save();
        this.chart = new chorus.views.visualizations[_.capitalize(this.type)]({model: this.task});
    },

    postRender : function() {
        this.$('.chart_icon.' + this.type).addClass("selected");
    },

    onExecutionComplete: function() {
        this.chartData.trigger('file:executionCompleted', this.task);
        this.chart.render();
    },

    additionalContext: function() {
        return {
            filterCount: 2,
            chartType: t("dataset.visualization.names." + this.type)
        }
    },

    showTabularData: function(e) {
        e && e.preventDefault();
        this.$('.results_console').removeClass("hidden");
        this.$(".dialog_controls a.hide").removeClass("hidden");
        this.$(".dialog_controls a.show").addClass("hidden");
    },

    hideTabularData: function(e) {
        e && e.preventDefault();
        this.$('.results_console').addClass("hidden")
        this.$(".dialog_controls a.show").removeClass("hidden");
        this.$(".dialog_controls a.hide").addClass("hidden");
    }
});