chorus.models.CsvHdfs = chorus.models.CSVImport.extend({
    urlTemplate: "data/{{instanceId}}/hdfs/{{encodedPath}}/sample",

    initialize: function() {
        this._super("initialize", arguments);
        this.set({encodedPath: encodeURIComponent(this.get("path"))});
    }
});