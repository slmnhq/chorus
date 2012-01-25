(function(ns) {
    ns.collections.WorkfileSet = ns.collections.Base.extend({
        model : ns.models.Workfile,
        urlTemplate : "workspace/{{workspaceId}}/workfile{{#if fileType}}?fileType={{fileType}}{{/if}}",
        showUrlTemplate : "workspaces/{{workspaceId}}/workfiles"
    });
})(chorus);
