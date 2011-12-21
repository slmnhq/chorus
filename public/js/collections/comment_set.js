(function(ns) {
    ns.CommentSet = ns.Collection.extend({
        model : ns.Comment,
        urlTemplate : "comment/workspace/{{workspaceId}}",
    });
})(chorus.models);
