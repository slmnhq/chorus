chorus.models.InstanceOwnership = chorus.models.Base.extend({
    constructorName: "InstanceOwnership",
    urlTemplate: "instances/{{instance_id}}/owner",
    parameterWrapper: "owner"
})