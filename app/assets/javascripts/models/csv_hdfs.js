chorus.models.CsvHdfs = chorus.models.CSVImport.extend({
    constructorName: "CsvHdfs",
    urlTemplate: function (options) {
        var defaultUrl = "hadoop_instances/{{hadoopInstanceId}}/contents/{{encode path}}";
        var postUrl = "workspace/{{workspaceId}}/externaltable";

        var method = options && options.method;
        return (method == "create" ? postUrl : defaultUrl);
    }
});