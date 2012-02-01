chorus.dialogs.Visualization = chorus.dialogs.Base.extend({
    className : "visualization",

    subviews: {
        ".tabledata": "chartData"
    },

    events: {
        "click a.show" : "showTabularData",
        "click a.hide" : "hideTabularData",
        "click button.close_dialog" : "closeModal"
    },

    setup : function() {
        this.type = this.options.launchElement.data("chart_type") || "boxplot"
        this.title = t("visualization.title", {name: this.options.launchElement.data("name")});

        this.chartData = new chorus.views.ResultsConsole();
        $(document).one('reveal.facebox', _.bind(function() {
            chorus.styleSelect(this.$(".headerbar select"));
        }, this));

        var func = 'make' + _.capitalize(this.type) + 'Task';
        this.task = this.model[func]({xAxis: "Foo", yAxis: "Bar"});
        this.task.save();
    },

    postRender : function() {
        this.$('.chart_icon.' + this.type).addClass("selected");
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
        this.$(".controls a.hide").removeClass("hidden");
        this.$(".controls a.show").addClass("hidden");
    },

    hideTabularData: function(e) {
        e && e.preventDefault();
        this.$('.results_console').addClass("hidden")
        this.$(".controls a.show").removeClass("hidden");
        this.$(".controls a.hide").addClass("hidden");
    }
});