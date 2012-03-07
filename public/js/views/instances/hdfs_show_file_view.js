chorus.views.HdfsShowFileView = chorus.views.Base.extend({
    constructorName: "HdfsShowFileView",
    className: "hdfs_show_file_view",

    additionalContext: function() {
        return {
            content: this.model && this.model.get('lines') && this.model.get('lines').join('\n')
        }
    }
})