;(function(ns) {
    ns.collections.DatasetSet = ns.collections.Base.extend({
        model : ns.models.Dataset,
        urlTemplate : "workspace/{{workspaceId}}/dataset"
    });
})(chorus);
