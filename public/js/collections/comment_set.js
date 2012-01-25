(function(ns) {
    ns.collections.CommentSet = ns.collections.Base.extend({
        model : ns.models.Comment,
        urlTemplate : "comment/workspace/{{workspaceId}}",
    });
})(chorus);
