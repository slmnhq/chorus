chorus.models.CsvHdfs = chorus.models.Base.extend({
    constructorName: "CsvHdfs",
    urlTemplate: function (options) {
        var defaultUrl = "hadoop_instances/{{hadoopInstanceId}}/files/{{id}}";
        var postUrl = "workspace/{{workspaceId}}/externaltable";

        var method = options && options.method;
        return (method == "create" ? postUrl : defaultUrl);
    },

    save: function(options) {
        return this._super("save", [options || {}, {method: "create"}]);
    }
});
