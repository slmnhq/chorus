chorus.views.InstanceIndexContentDetails = chorus.views.Base.extend({
    constructorName: "InstanceIndexContentDetailsView",
    templateName:"instance_index_content_details",

    additionalContext: function() {
        var greenplumInstances = this.options.greenplumInstances;
        var hadoopInstances = this.options.hadoopInstances;
        var gnipInstances = this.options.gnipInstances;

        this.requiredResources.add(greenplumInstances);
        this.requiredResources.add(hadoopInstances);
        this.requiredResources.add(gnipInstances);

        return {
            loaded: greenplumInstances.loaded && hadoopInstances.loaded && gnipInstances.loaded,
            count: greenplumInstances.models.length + hadoopInstances.models.length + gnipInstances.models.length
        }
    }
});