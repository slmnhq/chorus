chorus.collections.DatasetSet = chorus.collections.Base.extend({
    model:chorus.models.Dataset,
    urlTemplate:"workspace/{{workspaceId}}/dataset"
});