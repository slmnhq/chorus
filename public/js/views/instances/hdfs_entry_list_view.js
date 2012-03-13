chorus.views.HdfsEntryList = chorus.views.SelectableList.extend({
    constructorName: "HdfsEntryList",
    className: "hdfs_entry_list",

    collectionModelContext: function(model) {
        return {
            humanSize: I18n.toHumanSize(model.get("size")),
            iconUrl: model.get("isDir") ?
                "/images/instances/hadoop_directory_large.png" :
                chorus.urlHelpers.fileIconUrl(_.last(model.get("name").split("."))),
            showUrl: model.showUrl(),
            dirInfo: t("hdfs.directory_files", {count: model.get("count")}),
            displayableFiletype: model.get('isBinary') === false
        }
    },

    itemSelected: function(model) {
        chorus.PageEvents.broadcast("hdfs_entry:selected", model);
    }
});