chorus.views.SearchHdfs = chorus.views.SearchItemBase.extend({
    constructorName: "SearchHdfsView",
    templateName: "search_hdfs",
    eventType: "hdfs_entry",

    additionalContext: function() {
        var segments  = this.getHighlightedPathSegments();
        var pathLinks = _.map(this.model.pathSegments(), function(entry, index) {
            if (this.hasHighlightedAttributes(entry)) {
                var link = $("<a></a>").attr("href", entry.showUrl());
                link.html(segments[index]);
                return new Handlebars.SafeString(link.outerHtml());
            } else {
                return chorus.helpers.linkTo(entry.showUrl(), entry.get("name"));
            }
        }, this);
        var hadoopInstance = this.model.getHadoopInstance();

        return {
            showUrl: this.model.showUrl(),
            humanSize: I18n.toHumanSize(this.model.get("size")),
            iconUrl: chorus.urlHelpers.fileIconUrl(_.last(this.model.get("name").split("."))),
            instanceLink: chorus.helpers.linkTo(hadoopInstance.showUrl(), hadoopInstance.get('name')),
            completePath: new Handlebars.SafeString(pathLinks.join(" / ")),
            displayableFiletype: this.model.get('isBinary') === false
        }
    },

    getHighlightedPathSegments: function() {
        var path = this.hasHighlightedAttributes(this.model) ? this.model.get("highlightedAttributes")["path"][0] : this.model.get("path");
        return path.split(/\/(?!em>)/).slice(1);
    },

    hasHighlightedAttributes: function(model) {
        return model.get("highlightedAttributes") && model.get("highlightedAttributes")["path"];
    }
});
