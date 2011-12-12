(function(ns) {
    ns.MemberSet = ns.Collection.extend({
        model : ns.User,
        urlTemplate : "workspace/{{workspaceId}}/member",

        setup : function(options) {
            this.attributes.workspaceId = options.workspace.get("id")
        }
    });
})(chorus.models);
