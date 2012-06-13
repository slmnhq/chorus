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
        return new this([], { url: "/activities" });
    },

    forModel: function(model) {
        return new this([], { url: this.urlForModel(model) });
    },

    urlForModel: function(model) {
        // currently, HdfsEntry models don't have urls
        // this hack is here for specs that expect
        // HdfsEntries to have activities
        if (model instanceof chorus.models.HdfsEntry) {
            return "/not_yet_implemented";
        } else {
            var modelUriPath = new URI(model.url()).path();
            return modelUriPath + "/activities";
        }
    }
});
