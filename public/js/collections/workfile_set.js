(function(ns) {
    ns.WorkfileSet = ns.Collection.extend({
        model : ns.Workfile,
        urlTemplate : "workspace/{{workspaceId}}/workfile{{#if fileType}}?fileType={{fileType}}{{/if}}",
        showUrlTemplate : "workspaces/{{workspaceId}}/workfiles"
    });
})(chorus.models);
