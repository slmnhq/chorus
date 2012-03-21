chorus.views.SearchHdfs = chorus.views.SearchItemBase.extend({
    constructorName: "SearchHdfsView",
    className: "search_hdfs",
    eventType: "hdfs_entry",
    
    additionalContext: function() {
        var pathLinks = _.map(this.model.pathSegments(), function(entry) {
            return chorus.helpers.linkTo(entry.showUrl(), entry.get('name'));
        });
        var instance = this.model.getInstance();

        return {
            showUrl: this.model.showUrl(),
            humanSize: I18n.toHumanSize(this.model.get("size")),
            iconUrl: chorus.urlHelpers.fileIconUrl(_.last(this.model.get("name").split("."))),
            instanceLink: chorus.helpers.linkTo(instance.showUrl(), instance.get('name')),
            completePath: new Handlebars.SafeString(pathLinks.join(" / ")),
            displayableFiletype: this.model.get('isBinary') === false

        }
    }
});
