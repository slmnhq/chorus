chorus.views.SearchHdfsList = chorus.views.SearchResultListBase.extend({
    constructorName: "SearchHdfsListView",
    className: "search_hdfs_list",
    additionalClass: "list",

    additionalContext: function() {
        return {
            shown: this.collection.models.length,
            total: this.options.total,
            moreResults: (this.collection.models.length < this.options.total)
        }
    },

    collectionModelContext: function(model) {
        var instance = model.get("instance");
        var pathSoFar = "#/instances/" + instance.id + "/browse/";
        var parts = _.compact(model.get("path").split("/"));
        var $paths = _.map(parts.slice(0, -1), function(item) {
            return chorus.helpers.linkTo(pathSoFar += item + "/", item);
        });

        return {
            showUrl: "#/instances/" + instance.id + "/browseFile" + model.get("path"),
            humanSize: I18n.toHumanSize(model.get("size")),
            iconUrl: chorus.urlHelpers.fileIconUrl(_.last(model.get("name").split("."))),
            instanceLink: chorus.helpers.linkTo("#/instances/" + instance.id + "/browse/", instance.name),
            completePath: $paths.join(" / ")
        }
    }
});