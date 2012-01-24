;(function(ns) {
    ns.models.DatasetSet = ns.models.Collection.extend({
        model : ns.models.Dataset,
        urlTemplate : "workspace/{{workspaceId}}/dataset"
    });
})(chorus);
