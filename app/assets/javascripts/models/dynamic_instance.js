chorus.models.DynamicInstance = function(instanceJson) {
    var typeMap = {
        instance: 'GreenplumInstance',
        greenplum_instance: 'GreenplumInstance',
        hadoop_instance: 'HadoopInstance',
        gnip_instance: 'GnipInstance'
    };

    if (!chorus.models[typeMap[instanceJson.entityType]]) {
        console.error("constructing dynamic instance", instanceJson.entityType, instanceJson)
    }

    return new chorus.models[typeMap[instanceJson.entityType]](instanceJson);
};
