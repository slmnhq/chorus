(function(ns) {
    ns.WorkspaceSet = ns.Collection.extend({
        model : ns.Workspace,
        urlTemplate : "workspace/{{#if active}}?active=true{{/if}}"
    });
})(chorus.models);
