chorus.models.InstanceUsage = chorus.models.Base.extend({
    constructorName: "InstanceUsage",

    workspaceCount: function() {
        return this.get("workspaces") && this.get("workspaces").length;
    }
});
