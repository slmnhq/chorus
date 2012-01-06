;(function(ns) {
    ns.Draft = chorus.models.Base.extend({
        urlTemplate : "workspace/{{workspaceId}}/workfile/{{workfileId}}/draft"
    });
})(chorus.models);
