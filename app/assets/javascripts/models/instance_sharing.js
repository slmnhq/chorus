chorus.models.InstanceSharing = chorus.models.Base.extend({
    constructorName: "InstanceSharing",
    urlTemplate: "gpdb_instances/{{instanceId}}/sharing"
})