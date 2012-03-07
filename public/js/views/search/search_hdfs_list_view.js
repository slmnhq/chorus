chorus.views.SearchHdfsList = chorus.views.SearchResultListBase.extend({
    className: "search_hdfs_list",
    additionalClass: "list",

    additionalContext: function() {
        return {
            shown: this.collection.models.length,
            total: this.options.total,
            moreResults: (this.collection.models.length < this.options.total)
        }
    }
});