chorus.collections.WorkfileSet = chorus.collections.Base.extend({
    model:chorus.models.Workfile,
    urlTemplate:"workspaces/{{workspaceId}}/workfiles{{#if fileType}}?file_type={{fileType}}{{/if}}",
    showUrlTemplate:"workspaces/{{workspaceId}}/workfiles"
});