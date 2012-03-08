chorus.views.SearchHdfsList = chorus.views.SearchResultListBase.extend({
    constructorName: "SearchHdfsListView",
    className: "search_hdfs_list",
    additionalClass: "list",
    entityType: "hdfs",

    collectionModelContext: function(model) {
        var pathLinks = _.map(model.pathSegments(), function(entry) {
            return chorus.helpers.linkTo(entry.showUrl(), entry.get('name'));
        });
        var instance = model.getInstance();

        return {
            showUrl: model.showUrl(),
            humanSize: I18n.toHumanSize(model.get("size")),
            iconUrl: chorus.urlHelpers.fileIconUrl(_.last(model.get("name").split("."))),
            instanceLink: chorus.helpers.linkTo(instance.showUrl(), instance.get('name')),
            completePath: pathLinks.join(" / ")
        }
    }
});