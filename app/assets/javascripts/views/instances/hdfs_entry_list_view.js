chorus.views.HdfsEntryList = chorus.views.SelectableList.extend({
    constructorName: "HdfsEntryList",
    templateName: "hdfs_entry_list",
    useLoadingSection: true,
    eventName: "hdfs_entry",

    collectionModelContext: function(model) {
        var message;
        if(model.get("count") < 0) {
            message = t("hdfs.directory_files.no_permission");
        } else {
            message = t("hdfs.directory_files", {count: model.get("count")});
        }

        return {
            humanSize: I18n.toHumanSize(model.get("size")),
            iconUrl: model.get("isDir") ?
                "/images/instances/hadoop_directory_large.png" :
                chorus.urlHelpers.fileIconUrl(_.last(model.get("name").split("."))),
            showUrl: model.showUrl(),
            dirInfo: message,
            displayableFiletype: model.get('isBinary') === false
        }
    }
});
