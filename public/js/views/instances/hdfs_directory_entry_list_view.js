chorus.views.HdfsDirectoryEntryList = chorus.views.Base.extend({
    constructorName: "HdfsDirectoryEntryList",
    className: "hdfs_directory_entry_list",
    tagName: "ul",
    additionalClass: "list",

    collectionModelContext: function(model) {
        return {
            humanSize: I18n.toHumanSize(model.get("size")),
            iconUrl: chorus.urlHelpers.fileIconUrl(_.last(model.get("name").split(".")))
        }
    }
});