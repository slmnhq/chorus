chorus.views.ActivityListHeader = chorus.views.Base.extend({
    className : "activity_list_header",

    events: {
        "click .all":     "onAllClicked",
        "click .insights": "onInsightsClicked"
    },

    setup: function() {
        this.insightCount = chorus.models.CommentInsight.count();
        this.requiredResources.add(this.insightCount);
        this.insightCount.fetch();
    },

    additionalContext: function() {
        return {
            title: this.options.title,
            count: this.insightCount.get("numberOfInsight")
        };
    },

    onAllClicked: function() {
        this.$(".insights").removeClass("active");
        this.$(".all").addClass("active");
        this.$("h1").text(t("dashboard.title.activity"));
        this.collection.filterAll();
    },

    onInsightsClicked: function() {
        this.$(".all").removeClass("active");
        this.$(".insights").addClass("active");
        this.$("h1").text(t("dashboard.title.insights"));
        this.collection.filterInsights();
    }
});
