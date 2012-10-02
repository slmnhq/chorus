chorus.collections.ActivitySet = chorus.collections.Base.extend({
    constructorName: "ActivitySet",
    model: chorus.models.Activity,

    url: function() {
        if (this.attributes.insights) {
            var workspace = this.attributes.workspace
            if (workspace) {
                return "/insights?entity_type=workspace&entity_id=" + workspace.id;
            }
            return "/insights?entity_type=dashboard";
        } else {
            return this.attributes.url;
        }
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
