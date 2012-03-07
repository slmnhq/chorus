chorus.models.CsvHdfs = chorus.models.CSVImport.extend({
    urlTemplate: function (options) {
        var baseUrl = "data/{{instanceId}}/hdfs/{{encodedPath}}/";

        var method = options && options.method;
        return baseUrl + (method == "create" ? "externaltable" : "sample");
    },

    initialize: function() {
        this._super("initialize", arguments);
        this.set({encodedPath: encodeURIComponent(this.get("path"))});
    }
});