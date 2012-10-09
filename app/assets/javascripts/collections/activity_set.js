chorus.collections.ActivitySet = chorus.collections.Base.extend({
    constructorName: "ActivitySet",
    model: chorus.models.Activity,

    url: function(options) {
        if (this.attributes.insights) {
            return this.getInsightUrl();
        } else {
            var page = (options && options.page)|| 1;
            return this.attributes.url + "&page=" + page;
        }
    },

    getInsightUrl: function() {
        var workspace = this.attributes.workspace
        var url_base = "/insights";
        if (workspace) {
            return (url_base + "?entity_type=workspace&workspace_id=" + workspace.id);
        }
        return (url_base + "?entity_type=dashboard");
    }
}, {
    forDashboard: function() {
        return new this([], { url: "/activities?entity_type=dashboard" });
    },

    forModel: function(model) {
        return new this([], { url: this.urlForModel(model) });
    },

    urlForModel: function(model) {
        var entityId = model.id;
        return "/activities?entity_type=" + model.entityType + "&entity_id=" + entityId;
    }
});
