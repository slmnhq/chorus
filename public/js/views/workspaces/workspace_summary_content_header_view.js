chorus.views.WorkspaceSummaryContentHeader = chorus.views.Base.extend({
    constructorName: "WorkspaceSummaryContentHeaderView",
    className: "workspace_summary_content_header",
    useLoadingSection: true,

    subviews: {
        ".truncated_summary": "truncatedSummary",
        ".activity_list_header": "activityListHeader"
    },

    setup: function() {
        this.model.activities().fetchIfNotLoaded();
        this.requiredResources.push(this.model);
    },

    resourcesLoaded : function() {
        this.truncatedSummary = new chorus.views.TruncatedText({model:this.model, attribute:"summary", attributeIsHtmlSafe: true});
        this.activityListHeader = new chorus.views.ActivityListHeader({
            allTitle: this.model.get("name"),
            insightsTitle: this.model.get("name"),
            iconUrl: this.model.defaultIconUrl(),
            workspace: this.model,
            collection: this.model.activities()
        });
    },

    postRender: function() {
        if(this.model.get("summary")) {
            this.$(".truncated_summary").removeClass("hidden");
        } else {
            this.$(".truncated_summary").addClass("hidden");
        }
    }
});