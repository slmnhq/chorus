chorus.views.InstanceIndexContentDetails = chorus.views.Base.extend({
    constructorName: "InstanceIndexContentDetailsView",
    templateName:"instance_index_content_details",

    additionalContext: function() {
        var greenplumInstances = this.options.greenplumInstances;
        var hadoopInstances = this.options.hadoopInstances;

        this.requiredResources.add(greenplumInstances);
        this.requiredResources.add(hadoopInstances);

        return {
            loaded : greenplumInstances.loaded && hadoopInstances.loaded,
            count : greenplumInstances.models.length + hadoopInstances.models.length
        }
    }
});