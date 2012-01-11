;(function(ns) {
    ns.WorkfileNewVersion = chorus.models.Base.extend({
        urlTemplate : "workspace/{{workspaceId}}/workfile/{{workfileId}}/version"
    });
})(chorus.models);