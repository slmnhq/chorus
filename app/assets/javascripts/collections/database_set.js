chorus.collections.DatabaseSet = chorus.collections.Base.include(
    chorus.Mixins.InstanceCredentials.model
).extend({
    constructorName: "DatabaseSet",
    model:chorus.models.Database,
    urlTemplate: "gpdb_instances/{{instanceId}}/databases",
    showUrlTemplate: "instances/{{instanceId}}/databases"
});
