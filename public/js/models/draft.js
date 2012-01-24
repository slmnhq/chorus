;(function(ns) {
    ns.models.Draft = ns.models.Base.extend({
        urlTemplate : "workspace/{{workspaceId}}/workfile/{{id}}/draft"
    });
})(chorus);
