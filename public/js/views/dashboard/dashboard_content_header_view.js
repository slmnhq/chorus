chorus.views.DashboardContentHeader = chorus.views.Base.extend({
    className : "dashboard_content_header",

    events: {
        "click .all":     "onAllClicked",
        "click .insights": "onInsightsClicked"
    },

    setup: function() {
        this.insightCount = new chorus.models.CommentInsight({action: "count"});
        this.requiredResources.add(this.insightCount);
        this.insightCount.fetch();
    },

    additionalContext: function() {
        return { count: this.insightCount.get("count") };
    },

    onAllClicked: function() {
        this.$(".insights").removeClass("active");
        this.$(".all").addClass("active");
        this.$("h1").text(t("dashboard.title.activity"));
        this.trigger("filter:all");
    },

    onInsightsClicked: function() {
        this.$(".all").removeClass("active");
        this.$(".insights").addClass("active");
        this.$("h1").text(t("dashboard.title.insights"));
        this.trigger("filter:insights");
    }
});
