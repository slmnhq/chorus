chorus.collections.ActivitySet = chorus.collections.Base.extend({
    constructorName: "ActivitySet",
    model: chorus.models.Activity,

    url: function() {
        if (this.attributes.insights) {
            return "/commentinsight/";
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
        // currently, HdfsEntry models don't have urls
        // this hack is here for specs that expect
        // HdfsEntries to have activities
        if (model instanceof chorus.models.HdfsEntry || model instanceof chorus.models.HdfsFile) {
            return "/not_yet_implemented";
        } else {
            return "/activities?entity_type=" + model.entityType + "&entity_id=" + model.id;
        }
    }
});
