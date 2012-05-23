chorus.collections.DatabaseSet = chorus.collections.Base.include(
    chorus.Mixins.InstanceCredentials.model
).extend({
    model:chorus.models.Database,
    urlTemplate: "instances/{{instanceId}}/databases",
    showUrlTemplate: "instances/{{instanceId}}/databases"
});
