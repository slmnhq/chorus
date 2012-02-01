chorus.dialogs.Visualization = chorus.dialogs.Base.extend({
    className : "visualization",

    subviews: {
        ".tabledata": "chartData"
    },

    events: {
        "click a.show" : "showTabularData",
        "click a.hide" : "hideTabularData",
    },

    setup : function() {
        this.title = t("visualization.title", {name: this.options.launchElement.data("name")});

        this.chartData = new chorus.views.ResultsConsole();
        $(document).one('reveal.facebox', _.bind(function(){ chorus.styleSelect(this.$(".headerbar select")); }, this));
    },

    additionalContext: function() {
        return {
            filterCount: 2
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