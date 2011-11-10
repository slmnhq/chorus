(function(ns) {
    ns.WorkspaceSet = ns.Collection.extend({
        model : ns.Workspace,
        urlTemplate : "workspace/"
    });
})(chorus.models);
