(function(ns) {
    ns.WorkspaceSet = ns.Collection.extend({
        model : ns.Workspace,
        urlTemplate : "workspace/",

        additionalParams : function(){
            var params = []
            if(this.attributes.active) params.push("active=true");
            if(this.attributes.user) params.push("user=" + this.attributes.user.get("id"));
            if(this.attributes.showLatestComments) params.push("showLatestComments=true");
            return params;
        }
    });
})(chorus.models);
