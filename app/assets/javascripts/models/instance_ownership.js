chorus.models.InstanceOwnership = chorus.models.Base.extend({
    constructorName: "InstanceOwnership",
    urlTemplate: "instances/{{instanceId}}/owner",
    parameterWrapper: "owner"
})