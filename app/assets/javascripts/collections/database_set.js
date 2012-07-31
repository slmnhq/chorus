chorus.collections.DatabaseSet = chorus.collections.Base.include(
    chorus.Mixins.InstanceCredentials.model
).extend({
    constructorName: "DatabaseSet",
    model:chorus.models.Database,
    urlTemplate: "instances/{{instanceId}}/databases",
    showUrlTemplate: "instances/{{instanceId}}/databases"
});
