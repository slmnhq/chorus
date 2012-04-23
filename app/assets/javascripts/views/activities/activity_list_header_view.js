chorus.views.ActivityListHeader = chorus.views.Base.extend({
    constructorName: "ActivityListHeaderView",
    templateName : "activity_list_header",
    persistent: true,

    events: {
        "click .all":     "onAllClicked",
        "click .insights": "onInsightsClicked"
    },

    setup: function() {
        var options = {}
        if (this.model && this.model.entityType === "workspace") {
            options.urlParams = { workspaceId: this.model.get("id") };
        }
        this.insightCount = chorus.models.CommentInsight.count(options);
        this.requiredResources.add(this.insightCount);
        this.insightCount.fetch();
        this.collection = this.options.collection || (this.model && this.model.activities());

        this.allTitle = this.options.allTitle;
        this.insightsTitle = this.options.insightsTitle;
    },

    additionalContext: function() {
        return {
            title: this.pickTitle(),
            count: this.insightCount.get("numberOfInsight"),
            iconUrl: this.model && this.model.defaultIconUrl()
        };
    },

    pickTitle: function() {
        return this.model && this.model.entityType === "workspace" ?
            this.model.get("name") :
            this.collection.attributes.insights ? this.insightsTitle : this.allTitle;
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

        this.collection.attributes.insights = false;
        delete this.collection.attributes.workspace;
        this.collection.fetch();
    },

    onInsightsClicked: function(e) {
        e.preventDefault();

        this.$(".all").removeClass("active");
        this.$(".insights").addClass("active");

        this.collection.attributes.insights = true;
        this.collection.attributes.workspace = this.model;
        this.collection.fetch();
    }
});
