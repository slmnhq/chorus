;(function(ns) {
    ns.collections.WorkfileVersionSet = ns.collections.Base.extend({
        urlTemplate : "workspace/{{workspaceId}}/workfile/{{workfileId}}/version",
        model : ns.models.Workfile,
        comparator : function(model) {
            return -model.get("versionNum");
        }
    });
})(chorus);
