(function(ns) {
    ns.WorkspaceSet = ns.Collection.extend({
        model : ns.Workspace,
        urlTemplate : "workspace/",

        additionalParams : function(){
            var params = []
            if(this.attributes.active) params.push("active=true");
            if(this.attributes.membersOnly) params.push("user=" + chorus.session.user().get("id"));
            return params;
        }
    });
})(chorus.models);
