chorus.views.ActivityListHeader = chorus.views.Base.extend({
    className : "activity_list_header",
    persistent: true,

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
            title: this.collection.attributes.insights ? this.options.insightsTitle : this.options.allTitle,
            count: this.insightCount.get("numberOfInsight")
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
        this.collection.bind("reset", this.updateInsightCount, this)
    },

    updateInsightCount: function() {
        this.insightCount.bindOnce("loaded", this.render, this);
        this.insightCount.fetch();
    },

    onAllClicked: function(e) {
        e.preventDefault();

        this.$(".insights").removeClass("active");
        this.$(".all").addClass("active");
        this.$("h1").text(this.options.allTitle);

        this.collection.attributes.insights = false;
        this.collection.fetch();
    },

    onInsightsClicked: function(e) {
        e.preventDefault();

        this.$(".all").removeClass("active");
        this.$(".insights").addClass("active");
        this.$("h1").text(this.options.insightsTitle);

        this.collection.attributes.insights = true;
        this.collection.fetch();
    }
});
