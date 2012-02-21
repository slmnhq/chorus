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
        this.trigger("filter:all");
    },

    onInsightsClicked: function() {
        this.trigger("filter:insights");
    }
});
