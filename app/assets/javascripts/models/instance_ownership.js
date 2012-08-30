chorus.models.InstanceOwnership = chorus.models.Base.extend({
    constructorName: "InstanceOwnership",
    urlTemplate: "gpdb_instances/{{instanceId}}/owner",
    parameterWrapper: "owner"
})