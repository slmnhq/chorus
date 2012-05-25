chorus.collections.WorkfileSet = chorus.collections.Base.extend({
    model:chorus.models.Workfile,
    urlTemplate:"workspaces/{{workspaceId}}/workfiles{{#if fileType}}?fileType={{fileType}}{{/if}}",
    showUrlTemplate:"workspaces/{{workspaceId}}/workfiles"
});