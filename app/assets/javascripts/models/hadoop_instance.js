chorus.models.HadoopInstance = chorus.models.Instance.extend({
    constructorName: "HadoopInstance",
    urlTemplate: "hadoop_instances/{{id}}",

    providerIconUrl: function() {
        return "/images/instances/hadoop_instance.png";
    },

    declareValidations: function() {}
});
