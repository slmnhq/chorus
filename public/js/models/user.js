(function(ns) {
    ns.User = chorus.models.Base.extend({
        urlTemplate : "user/{{userName}}",

        getWorkspaces: function() {
            var workspaces = new ns.WorkspaceSet();
            workspaces.urlTemplate = "workspaces?user=" + this.get("userName");
            return workspaces;
        }
    });
})(chorus.models);
