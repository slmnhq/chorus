(function(ns) {
    ns.WorkfileSet = ns.Collection.extend({
        model : ns.Workfile,
        urlTemplate : "workspace/{{workspaceId}}/workfile{{#if type}}?type={{type}}{{/if}}"
    });
})(chorus.models);