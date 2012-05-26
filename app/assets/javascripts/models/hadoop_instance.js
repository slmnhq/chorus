chorus.models.HadoopInstance = chorus.models.Instance.extend({
    constructorName: "HadoopInstance",
    urlTemplate: "hadoop_instances/{{id}}",
    showUrlTemplate: "hadoop_instances/{{id}}/browse/",

    providerIconUrl: function() {
        return "/images/instances/hadoop_instance.png";
    },

    declareValidations: function() {},

    entriesForPath: function(path) {
        return new chorus.collections.HdfsEntrySet([], {
            path: path,
            hadoopInstance: {
                id: this.get("id")
            }
        });
    }
});
