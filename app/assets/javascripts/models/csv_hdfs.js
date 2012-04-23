chorus.models.CsvHdfs = chorus.models.CSVImport.extend({
    constructorName: "CsvHdfs",
    urlTemplate: function (options) {
        var defaultUrl = "data/{{instanceId}}/hdfs/{{encode path}}/sample";
        var postUrl = "workspace/{{workspaceId}}/externaltable";

        var method = options && options.method;
        return (method == "create" ? postUrl : defaultUrl);
    }
});