(function(ns) {
    ns.User = chorus.models.Base.extend({
        urlTemplate : "user/{{userName}}",

        getWorkspaces: function() {
            if (!this._workspaces) {
                this._workspaces = new ns.WorkspaceSet();
                this._workspaces.urlTemplate = "workspace/?user=" + this.get("userName");
                this._workspaces.bind("reset", function() {
                    this.trigger("change");
                }, this);
            }
            return this._workspaces;
        }
    });
})(chorus.models);
