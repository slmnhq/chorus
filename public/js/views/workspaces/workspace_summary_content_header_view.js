chorus.views.WorkspaceSummaryContentHeader = chorus.views.Base.extend({
    constructorName: "WorkspaceSummaryContentHeaderView",
    className: "workspace_summary_content_header",
    useLoadingSection: true,

    subviews: {
        ".truncated_summary": "truncatedSummary",
        ".activity_list_header": "activityListHeader"
    },

    setup: function() {
        var activities = this.model.activities();
        activities.fetchIfNotLoaded();

        this.model.onLoaded(function() {
            this.truncatedSummary = new chorus.views.TruncatedText({model:this.model, attribute:"summary"});

            this.activityListHeader = new chorus.views.ActivityListHeader({
                collection: activities,
                allTitle: t("workspace.recent_activity", {name: this.model.get("name")}),
                insightsTitle: t("workspace.recent_insights", {name: this.model.get("name")}),
                workspace: this.model
            });
        }, this);
    }
});