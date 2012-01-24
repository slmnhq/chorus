;(function(ns){
    ns.models.Dataset = ns.models.Base.extend({
        urlTemplate: "workspace/{{workspaceId}}/dataset/{{datasetId}}"
    });
})(chorus);
