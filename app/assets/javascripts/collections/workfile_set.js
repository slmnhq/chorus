chorus.collections.WorkfileSet = chorus.collections.Base.extend({
    constructorName: "WorkfileSet",
    model:chorus.models.Workfile,
    urlTemplate:"workspace/{{workspaceId}}/workfile{{#if fileType}}?fileType={{fileType}}{{/if}}",
    showUrlTemplate:"workspaces/{{workspaceId}}/workfiles"
});
