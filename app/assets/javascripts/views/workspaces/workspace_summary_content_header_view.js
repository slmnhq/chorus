chorus.views.WorkspaceSummaryContentHeader = chorus.views.Base.extend({
    constructorName: "WorkspaceSummaryContentHeaderView",
    templateName: "workspace_summary_content_header",
    useLoadingSection: true,

    subviews: {
        ".truncated_summary": "truncatedSummary",
        ".activity_list_header": "activityListHeader"
    },

    setup: function() {
        this.model.activities().fetchIfNotLoaded();
        this.bindings.add(this.model, "saved", this.render);
        this.requiredResources.push(this.model);
    },

    resourcesLoaded : function() {
        this.truncatedSummary = new chorus.views.TruncatedText({model:this.model, attribute:"summary", attributeIsHtmlSafe: true, extraLine: true});
        this.activityListHeader = new chorus.views.ActivityListHeader({
              model: this.model,
              allTitle: this.model.get("name"),
              insightsTitle: this.model.get("name")
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