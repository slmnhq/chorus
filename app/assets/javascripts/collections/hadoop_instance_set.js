chorus.collections.HadoopInstanceSet = chorus.collections.Base.extend({
    constructorName: "HadoopInstanceSet",
    model: chorus.models.HadoopInstance,
    urlTemplate: "hadoop_instances",

    comparator: function(instance) {
        return instance.get("name").toLowerCase();
    }
});
