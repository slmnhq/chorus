chorus.views.ActivityListHeader = chorus.views.Base.extend({
    constructorName: "ActivityListHeaderView",
    className : "activity_list_header",
    persistent: true,

    events: {
        "click .all":     "onAllClicked",
        "click .insights": "onInsightsClicked"
    },

    setup: function() {
        var options = {}
        if (this.options.workspace) {
            options.urlParams = { workspaceId: this.options.workspace.get("id") };
        }
        this.insightCount = chorus.models.CommentInsight.count(options);
        this.requiredResources.add(this.insightCount);
        this.insightCount.fetch();
        this.allTitle = this.options.allTitle;
        this.insightsTitle = this.options.insightsTitle;
    },

    additionalContext: function() {
        return {
            title: this.collection.attributes.insights ? this.insightsTitle : this.allTitle,
            count: this.insightCount.get("numberOfInsight"),
            iconUrl: this.options.iconUrl
        };
    },

    postRender: function() {
        if (this.collection.attributes.insights) {
            this.$("a.insights").addClass("active")
        } else {
            this.$("a.all").addClass("active")
        }
    },

    resourcesLoaded: function() {
        this.bindings.add(this.collection, "reset", this.updateInsightCount);
    },

    updateInsightCount: function() {
        this.insightCount.bindOnce("loaded", this.render, this);
        this.insightCount.fetch();
    },

    onAllClicked: function(e) {
        e.preventDefault();

        this.$(".insights").removeClass("active");
        this.$(".all").addClass("active");
        this.$("h1").text(this.allTitle);
        this.$("h1").attr("title", this.allTitle);

        this.collection.attributes.insights = false;
        delete this.collection.attributes.workspace;
        this.collection.fetch();
    },

    onInsightsClicked: function(e) {
        e.preventDefault();

        this.$(".all").removeClass("active");
        this.$(".insights").addClass("active");
        this.$("h1").text(this.insightsTitle);
        this.$("h1").attr("title", this.insightsTitle);

        this.collection.attributes.insights = true;
        this.collection.attributes.workspace = this.options.workspace;
        this.collection.fetch();
    }
});
