chorus.views.SearchHdfsList = chorus.views.SearchResultListBase.extend({
    constructorName: "SearchHdfsListView",
    className: "search_hdfs_list",
    entityType: "hdfs",

    makeListItemView: function(model) {
        return new chorus.views.SearchHdfs({ model: model });
    }
});