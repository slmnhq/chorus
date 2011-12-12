(function(ns) {
    ns.MemberSet = ns.Collection.extend({
        model : ns.User,
        urlTemplate : "workspace/{{workspaceId}}/member"
    });
})(chorus.models);
