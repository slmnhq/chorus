chorus.models.CsvHdfs = chorus.models.CSVImport.extend({
    constructorName: "CsvHdfs",
    urlTemplate: function (options) {
        // TODO: Change the path to the correct HDFS content path (e.g. /hadoop_instances/{{instanceId}}/contents/{{path}})
        var defaultUrl = "data/{{instanceId}}/hdfs/{{encode path}}/sample";
        var postUrl = "workspace/{{workspaceId}}/externaltable";

        var method = options && options.method;
        return (method == "create" ? postUrl : defaultUrl);
    }
});