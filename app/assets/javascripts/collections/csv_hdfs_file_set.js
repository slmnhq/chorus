chorus.collections.CsvHdfsFileSet = chorus.collections.HdfsEntrySet.extend({
    constructorName: "CsvHdfsFileSet",
    model: chorus.models.CsvHdfs,

    hdfsEntryTextFiles: function() {
        var nonTextFiles = _.filter(this.models, function(hdfsEntry) {
            return hdfsEntry.get("isBinary") || hdfsEntry.get("isDir");
        });

        return this.remove(nonTextFiles);
    }
});